import { Hive } from '@hive/sdk';
import { pathfindingWalkTo } from '../movement/pathfinding.mjs?rev=combined-navigation-20260714';
import { potionStat } from './AutoDrinkController.mjs?rev=vault-drink-20260717';
import { stopMoving } from '../sdk/compat.mjs';

const POLL_MS = 200;
const ROUTE_RETRY_MS = 3000;
const ACTION_TIMEOUT_MS = 8000;
const BLOCK_MS = 5000;
const CONTAINER_RANGE = 1.25;

function isVaultMap() {
  return String(Hive.world.getName?.() ?? '').trim().toLowerCase().includes('vault');
}

function slotKey(container, slotId) {
  return `${container}:${slotId}`;
}

/**
 * Retrieves and drinks unmaxed stat potions from known Vault / potion-vault data.
 *
 * Responsibility split:
 * - Setting `drinkVaultPotionsEnabled` gates whether this task may start.
 * - Intent `drinkVaultPotionsActive` preempts realm/dungeon work while running.
 * - Nexus tree (`VaultEnabledLeaf`) walks to / enters the Vault entrance.
 * - This controller handles non-Nexus routing plus Vault retrieve/drink.
 */
export class DrinkVaultPotionsController {
  constructor(controller) {
    this.controller = controller;
    this.activity = 'Drink Vault Potions';
    this.active = null;
    this.lastRouteCommandAt = 0;
    this.blockedUntil = new Map();
    this.inventoryFullStop = false;
  }

  reset() {
    this.clearActive();
    this.blockedUntil.clear();
    this.inventoryFullStop = false;
    this.lastRouteCommandAt = 0;
  }

  getActivityLabel() {
    return this.activity;
  }

  onLoop() {
    const { state } = this.controller;
    if (!state.automationRunning || !state.drinkVaultPotionsEnabled) {
      this.clearActive();
      return null;
    }
    // Need Vault baseline data before scanning account storage.
    if (!state.vaultOnStartDone) return null;

    this.pruneBlocks();

    if (this.inventoryFullStop) {
      if (this.firstEmptyInventorySlot() !== null) this.inventoryFullStop = false;
      else {
        this.clearActive();
        return null;
      }
    }

    const eligible = this.findEligiblePotions();
    if (!this.active && eligible.length === 0) {
      this.clearActive();
      return null;
    }

    state.drinkVaultPotionsActive = true;
    if (!this.active) {
      this.active = {
        ...eligible[0],
        phase: 'navigate',
        startedAt: Date.now(),
        startingValue: null,
        inventorySlot: null,
      };
      this.controller.appendActivity(
        `Vault potions: retrieving ${this.active.info?.name ?? this.active.stat.label}`,
      );
    }

    return this.continueActive();
  }

  continueActive() {
    const action = this.active;
    if (!action) {
      this.clearActive();
      return null;
    }

    const base = Hive.self.getBaseStats?.() ?? {};
    const caps = Hive.self.getStatCaps?.() ?? {};
    if (!this.needsStat(base, caps, action.stat.key)) {
      this.finishPotion(`Vault potions: ${action.stat.label} is maxed`);
      return this.afterPotionStep();
    }

    if (!isVaultMap()) {
      if (Hive.world.isNexus()) {
        // Nexus tree owns Vault entrance navigation while intent is sticky.
        this.activity = 'Enter Vault';
        return null;
      }
      this.activity = 'Return To Nexus';
      this.routeToNexus('Vault potions: returning to Nexus');
      return POLL_MS;
    }

    // Once withdrawn (or drinking from inventory), do not require the vault slot to still exist.
    if (action.phase === 'wait-withdraw') {
      return this.waitWithdraw(action, base);
    }
    if (action.phase === 'wait-drink') {
      return this.waitDrink(action, base);
    }

    const live = this.findLiveSlot(action);
    if (!live) {
      this.block(action, 'potion no longer available in Vault');
      return this.afterPotionStep();
    }
    action.container = live.container;
    action.slotId = live.slotId;
    action.objectId = live.objectId;
    action.objectType = live.objectType;
    if (live.info) action.info = live.info;
    if (live.stat) action.stat = live.stat;
    if (live.key) action.key = live.key;

    if (action.phase === 'navigate' || action.phase === 'approach') {
      return this.approachAndPrepare(action, base);
    }

    action.phase = 'navigate';
    return POLL_MS;
  }

  afterPotionStep() {
    if (this.controller.state.drinkVaultPotionsActive) return POLL_MS;
    return null;
  }

  approachAndPrepare(action, base) {
    this.activity = 'Walk To Potion Chest';
    const position = this.containerPosition(action.objectId);
    if (position && Hive.self.distanceTo(position) > CONTAINER_RANGE) {
      pathfindingWalkTo(this.controller, position.x, position.y, CONTAINER_RANGE);
      action.phase = 'approach';
      return POLL_MS;
    }

    stopMoving();
    const inventorySlot = this.firstEmptyInventorySlot();
    if (inventorySlot === null) {
      this.inventoryFullStop = true;
      this.controller.appendActivity('Vault potions: inventory full; stopping');
      this.clearActive();
      return POLL_MS;
    }

    // Prefer direct container use if the SDK ever exposes it; fall back to withdraw + useItem.
    if (typeof Hive.inventory.useContainerItem === 'function') {
      const used = Hive.inventory.useContainerItem({
        container: action.container,
        slotId: action.slotId,
      });
      if (used) {
        action.phase = 'wait-drink';
        action.startedAt = Date.now();
        action.startingValue = Number(base[action.stat.key]) || 0;
        action.inventorySlot = null;
        this.activity = 'Drink Potion';
        return POLL_MS;
      }
    }

    const accepted = Hive.inventory.swapContainers(
      { container: action.container, slotId: action.slotId },
      { container: 'inventory', slotId: inventorySlot },
    );
    if (!accepted) {
      this.block(action, 'withdraw command was rejected');
      return this.afterPotionStep();
    }

    action.inventorySlot = inventorySlot;
    action.phase = 'wait-withdraw';
    action.startedAt = Date.now();
    action.startingValue = Number(base[action.stat.key]) || 0;
    this.activity = 'Withdraw Potion';
    return POLL_MS;
  }

  waitWithdraw(action, base) {
    this.activity = 'Withdraw Potion';
    const inventory = Hive.inventory.getAll();
    if ((inventory[action.inventorySlot] ?? -1) === action.objectType) {
      stopMoving();
      Hive.inventory.useItem(action.inventorySlot);
      action.phase = 'wait-drink';
      action.startedAt = Date.now();
      action.startingValue = Number(base[action.stat.key]) || 0;
      this.activity = 'Drink Potion';
      return POLL_MS;
    }
    if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, 'withdraw confirmation timed out');
      return this.afterPotionStep();
    }
    return POLL_MS;
  }

  waitDrink(action, base) {
    this.activity = 'Drink Potion';
    const current = Number(base[action.stat.key]) || 0;
    if (current > (action.startingValue ?? current)) {
      this.finishPotion(`Vault potions: drank ${action.info?.name ?? action.stat.label}`);
      return this.afterPotionStep();
    }

    if (action.inventorySlot != null) {
      const inventory = Hive.inventory.getAll();
      if ((inventory[action.inventorySlot] ?? -1) !== action.objectType) {
        this.finishPotion(`Vault potions: used ${action.info?.name ?? action.stat.label}`);
        return this.afterPotionStep();
      }
      if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
        Hive.inventory.useItem(action.inventorySlot);
        action.startedAt = Date.now();
        if (!action.retriedUse) {
          action.retriedUse = true;
          return POLL_MS;
        }
        this.block(action, 'drink confirmation timed out');
        return this.afterPotionStep();
      }
    } else if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, 'drink confirmation timed out');
      return this.afterPotionStep();
    }

    return POLL_MS;
  }

  findEligiblePotions() {
    if (typeof Hive.self.getBaseStats !== 'function' || typeof Hive.self.getStatCaps !== 'function') {
      return [];
    }
    const base = Hive.self.getBaseStats();
    const caps = Hive.self.getStatCaps();
    const remaining = this.remainingNeeds(base, caps);
    if (Object.keys(remaining).length === 0) return [];

    const now = Date.now();
    const candidates = [];

    if (isVaultMap()) {
      for (const container of ['potionVault', 'vault']) {
        for (const slot of Hive.inventory.getContainerSlots(container) ?? []) {
          if (slot.objectType < 0) continue;
          const key = slotKey(container, slot.slotId);
          if ((this.blockedUntil.get(key) ?? 0) > now) continue;
          const info = Hive.loot.getItemInfo(slot.objectType);
          const stat = potionStat(info);
          if (!stat || !remaining[stat.key]) continue;
          candidates.push({
            container,
            slotId: slot.slotId,
            objectId: slot.objectId,
            objectType: slot.objectType,
            info,
            stat,
            key,
          });
        }
      }
    } else {
      const snapshot = this.vaultSnapshot();
      if (!snapshot?.complete) return [];
      const sections = [
        { container: 'potionVault', types: snapshot.potion ?? [], chests: snapshot.containers?.potion ?? [] },
        { container: 'vault', types: snapshot.vault ?? [], chests: snapshot.containers?.vault ?? [] },
      ];
      for (const section of sections) {
        for (let slotId = 0; slotId < section.types.length; slotId++) {
          const objectType = Number(section.types[slotId] ?? -1);
          if (objectType < 0) continue;
          const key = slotKey(section.container, slotId);
          if ((this.blockedUntil.get(key) ?? 0) > now) continue;
          const info = Hive.loot.getItemInfo(objectType);
          const stat = potionStat(info);
          if (!stat || !remaining[stat.key]) continue;
          const chest = section.chests.find((entry) => (
            slotId >= entry.startSlot && slotId < entry.startSlot + entry.slotCount
          ));
          candidates.push({
            container: section.container,
            slotId,
            objectId: chest?.objectId
              ?? (section.container === 'potionVault'
                ? snapshot.objectIds?.potion
                : snapshot.objectIds?.vault)
              ?? -1,
            objectType,
            info,
            stat,
            key,
          });
        }
      }
    }

    candidates.sort((left, right) => (
      (left.container === 'potionVault' ? 0 : 1) - (right.container === 'potionVault' ? 0 : 1)
      || left.slotId - right.slotId
    ));

    // Cap planned picks per stat to remaining need (one-at-a-time selection uses [0]).
    const selected = [];
    const planned = { ...remaining };
    for (const candidate of candidates) {
      if ((planned[candidate.stat.key] ?? 0) <= 0) continue;
      selected.push(candidate);
      planned[candidate.stat.key] -= 1;
    }
    return selected;
  }

  findLiveSlot(action) {
    const slots = Hive.inventory.getContainerSlots(action.container) ?? [];
    const exact = slots.find((slot) => (
      slot.slotId === action.slotId && slot.objectType === action.objectType
    ));
    if (exact) return { ...exact, container: action.container };

    const base = Hive.self.getBaseStats?.() ?? {};
    const caps = Hive.self.getStatCaps?.() ?? {};
    for (const container of ['potionVault', 'vault']) {
      for (const slot of Hive.inventory.getContainerSlots(container) ?? []) {
        if (slot.objectType < 0) continue;
        const key = slotKey(container, slot.slotId);
        if ((this.blockedUntil.get(key) ?? 0) > Date.now()) continue;
        const info = Hive.loot.getItemInfo(slot.objectType);
        const stat = potionStat(info);
        if (!stat || stat.key !== action.stat.key) continue;
        if (!this.needsStat(base, caps, stat.key)) continue;
        return { ...slot, container, info, stat, key };
      }
    }
    return null;
  }

  containerPosition(objectId) {
    if (!(objectId > 0)) return null;
    try {
      const object = Hive.world.objects.getById?.(objectId)
        ?? Hive.world.getObject?.(objectId);
      if (!object) return null;
      const position = object.position ?? object;
      if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return null;
      return { x: position.x, y: position.y };
    } catch {
      return null;
    }
  }

  remainingNeeds(base, caps) {
    const needs = {};
    for (const key of ['attack', 'defense', 'speed', 'vitality', 'wisdom', 'dexterity', 'maxHP', 'maxMP']) {
      if (this.needsStat(base, caps, key)) {
        needs[key] = Math.max(0, Number(caps[key]) - Number(base[key]));
      }
    }
    return needs;
  }

  needsStat(base, caps, key) {
    const current = Number(base?.[key]);
    const cap = Number(caps?.[key]);
    return Number.isFinite(current) && Number.isFinite(cap) && cap > 0 && current < cap;
  }

  firstEmptyInventorySlot(inventory = Hive.inventory.getAll()) {
    const backpack = Number(Hive.inventory.getBackpack?.() ?? 1) || 1;
    const maximumSlot = backpack >= 3 ? 27 : backpack >= 2 ? 19 : 11;
    for (let slotIndex = 4; slotIndex <= maximumSlot; slotIndex++) {
      if ((inventory[slotIndex] ?? -1) < 0) return slotIndex;
    }
    return null;
  }

  vaultSnapshot() {
    try {
      if (typeof Hive.inventory.getVaultSnapshot === 'function') return Hive.inventory.getVaultSnapshot();
      if (typeof Hive.inventory.getEntireVault === 'function') return Hive.inventory.getEntireVault();
      return null;
    } catch {
      return null;
    }
  }

  routeToNexus(message) {
    if (Date.now() - this.lastRouteCommandAt < ROUTE_RETRY_MS) return;
    this.lastRouteCommandAt = Date.now();
    stopMoving();
    Hive.walking.nexus();
    if (message) this.controller.appendActivity(message);
  }

  finishPotion(message) {
    if (this.active) {
      this.blockedUntil.set(this.active.key, Date.now() + 500);
    }
    this.active = null;
    if (message) this.controller.appendActivity(message);
    if (this.findEligiblePotions().length === 0) this.clearActive();
  }

  block(action, reason) {
    if (action?.key) this.blockedUntil.set(action.key, Date.now() + BLOCK_MS);
    this.active = null;
    if (reason) this.controller.appendActivity(`Vault potions skipped: ${reason}`);
    if (this.findEligiblePotions().length === 0) this.clearActive();
  }

  clearActive(message) {
    this.active = null;
    this.activity = 'Drink Vault Potions';
    this.controller.state.drinkVaultPotionsActive = false;
    if (message) this.controller.appendActivity(message);
  }

  pruneBlocks() {
    const now = Date.now();
    for (const [key, until] of this.blockedUntil) {
      if (until <= now) this.blockedUntil.delete(key);
    }
  }
}
