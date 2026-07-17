import { Hive } from '@hive/sdk';
import { pathfindingWalkTo } from '../movement/pathfinding.mjs?rev=combined-navigation-20260714';
import {
  compareEquipmentCandidates,
  EQUIPMENT,
  evaluateEquipmentItem,
} from './AutoLootController.mjs?rev=equip-vault-upgrades-20260717';
import { stopMoving } from '../sdk/compat.mjs';

const POLL_MS = 200;
const ROUTE_RETRY_MS = 3000;
const ACTION_TIMEOUT_MS = 8000;
const BLOCK_MS = 5000;
const CONTAINER_RANGE = 1.25;

/** Storage sections that can hold equippable gear. */
const GEAR_CONTAINERS = Object.freeze([
  { container: 'vault', snapshotKey: 'vault', chestsKey: 'vault', objectIdKey: 'vault' },
  { container: 'giftChest', snapshotKey: 'gift', chestsKey: 'gift', objectIdKey: 'gift' },
  { container: 'spoilsChest', snapshotKey: 'seasonalSpoils', chestsKey: 'seasonalSpoils', objectIdKey: 'seasonalSpoils' },
  { container: 'materialVault', snapshotKey: 'material', chestsKey: 'material', objectIdKey: 'material' },
]);

function isVaultMap() {
  return String(Hive.world.getName?.() ?? '').trim().toLowerCase().includes('vault');
}

function slotKey(container, slotId) {
  return `${container}:${slotId}`;
}

/**
 * Retrieves and equips vault gear that AutoLoot's evaluator considers an upgrade.
 *
 * Responsibility split:
 * - Setting `equipVaultUpgradesEnabled` gates whether this task may start.
 * - Intent `equipVaultUpgradesActive` preempts realm/dungeon work while running.
 * - Nexus tree (`VaultEnabledLeaf`) walks to / enters the Vault entrance.
 * - This controller handles non-Nexus routing plus Vault withdraw/equip.
 */
export class EquipVaultUpgradesController {
  constructor(controller) {
    this.controller = controller;
    this.activity = 'Equip Vault Upgrades';
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
    if (!state.automationRunning || !state.equipVaultUpgradesEnabled) {
      this.clearActive();
      return null;
    }
    if (!state.vaultOnStartDone) return null;

    this.pruneBlocks();

    if (this.inventoryFullStop) {
      if (this.firstEmptyInventorySlot() !== null) this.inventoryFullStop = false;
      else {
        this.clearActive();
        return null;
      }
    }

    const eligible = this.findEligibleUpgrades();
    if (!this.active && eligible.length === 0) {
      this.clearActive();
      return null;
    }

    state.equipVaultUpgradesActive = true;
    if (!this.active) {
      const plan = eligible[0];
      this.active = {
        ...plan,
        phase: 'navigate',
        startedAt: Date.now(),
        destinationSlot: plan.requiresBuffer ? null : plan.equipmentSlot,
        bufferSlot: null,
      };
      this.controller.appendActivity(
        `Vault upgrades: retrieving ${plan.info?.name ?? `T${plan.tier} ${plan.category}`}`,
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

    if (!isVaultMap()) {
      if (Hive.world.isNexus()) {
        this.activity = 'Enter Vault';
        return null;
      }
      this.activity = 'Return To Nexus';
      this.routeToNexus('Vault upgrades: returning to Nexus');
      return POLL_MS;
    }

    if (action.phase === 'wait-withdraw' || action.phase === 'wait-buffer') {
      return this.waitWithdraw(action);
    }
    if (action.phase === 'wait-equipped') {
      return this.waitEquipped(action);
    }

    const live = this.findLiveSlot(action);
    if (!live) {
      this.block(action, 'upgrade no longer available in Vault');
      return this.afterStep();
    }
    action.container = live.container;
    action.slotId = live.slotId;
    action.objectId = live.objectId;
    action.objectType = live.objectType;
    if (live.info) action.info = live.info;
    if (live.key) action.key = live.key;

    // Re-evaluate against current equipped gear before committing.
    const inventory = Hive.inventory.getAll();
    const evaluated = evaluateEquipmentItem(
      action.objectType,
      inventory,
      (category) => this.thresholdFor(category),
    );
    if (!evaluated?.upgrade) {
      this.block(action, 'item is no longer an upgrade');
      return this.afterStep();
    }
    Object.assign(action, evaluated);

    if (action.phase === 'navigate' || action.phase === 'approach') {
      return this.approachAndWithdraw(action, inventory);
    }

    action.phase = 'navigate';
    return POLL_MS;
  }

  afterStep() {
    if (this.controller.state.equipVaultUpgradesActive) return POLL_MS;
    return null;
  }

  approachAndWithdraw(action, inventory) {
    this.activity = 'Walk To Upgrade Chest';
    const position = this.containerPosition(action.objectId);
    if (position && Hive.self.distanceTo(position) > CONTAINER_RANGE) {
      pathfindingWalkTo(this.controller, position.x, position.y, CONTAINER_RANGE);
      action.phase = 'approach';
      return POLL_MS;
    }

    stopMoving();

    if (action.requiresBuffer) {
      const bufferSlot = this.firstEmptyInventorySlot(inventory);
      if (bufferSlot === null) {
        this.inventoryFullStop = true;
        this.controller.appendActivity('Vault upgrades: inventory full; stopping');
        this.clearActive();
        return POLL_MS;
      }
      action.destinationSlot = bufferSlot;
      action.bufferSlot = bufferSlot;
    } else {
      action.destinationSlot = action.equipmentSlot;
      action.bufferSlot = null;
    }

    const accepted = Hive.inventory.swapContainers(
      { container: action.container, slotId: action.slotId },
      { container: 'inventory', slotId: action.destinationSlot },
    );
    if (!accepted) {
      this.block(action, 'withdraw command was rejected');
      return this.afterStep();
    }

    action.phase = action.requiresBuffer ? 'wait-buffer' : 'wait-equipped';
    action.startedAt = Date.now();
    this.activity = action.requiresBuffer ? 'Withdraw Upgrade' : 'Equip Upgrade';
    return POLL_MS;
  }

  waitWithdraw(action) {
    this.activity = action.requiresBuffer ? 'Withdraw Upgrade' : 'Equip Upgrade';
    const inventory = Hive.inventory.getAll();

    if (action.phase === 'wait-buffer') {
      if (inventory[action.destinationSlot] === action.objectType) {
        if (inventory[action.equipmentSlot] !== action.equippedObjectType) {
          this.block(action, 'equipped item changed before the upgrade');
          return this.afterStep();
        }
        Hive.inventory.swapSlots(action.destinationSlot, action.equipmentSlot);
        action.phase = 'wait-equipped';
        action.startedAt = Date.now();
        this.activity = 'Equip Upgrade';
        return POLL_MS;
      }
    }

    if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, 'withdraw confirmation timed out');
      return this.afterStep();
    }
    return POLL_MS;
  }

  waitEquipped(action) {
    this.activity = 'Equip Upgrade';
    const inventory = Hive.inventory.getAll();
    if (inventory[action.equipmentSlot] === action.objectType) {
      this.finishUpgrade(action);
      return this.afterStep();
    }
    // Direct vault→equip may land in destination first when destination was equipment slot.
    if (!action.requiresBuffer && inventory[action.destinationSlot] === action.objectType) {
      this.finishUpgrade(action);
      return this.afterStep();
    }
    if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, 'equip confirmation timed out');
      return this.afterStep();
    }
    return POLL_MS;
  }

  findEligibleUpgrades() {
    const inventory = Hive.inventory.getAll();
    const emptySlot = this.firstEmptyInventorySlot(inventory);
    const now = Date.now();
    const candidates = [];
    const bestBySlot = new Map();

    const consider = (candidate) => {
      if (!candidate.upgrade) return;
      if (candidate.requiresBuffer && emptySlot === null) return;
      const existing = bestBySlot.get(candidate.equipmentSlot);
      if (!existing || compareEquipmentCandidates(candidate, existing) < 0) {
        bestBySlot.set(candidate.equipmentSlot, candidate);
      }
    };

    if (isVaultMap()) {
      for (const section of GEAR_CONTAINERS) {
        for (const slot of Hive.inventory.getContainerSlots(section.container) ?? []) {
          if (slot.objectType < 0) continue;
          const key = slotKey(section.container, slot.slotId);
          if ((this.blockedUntil.get(key) ?? 0) > now) continue;
          const evaluated = evaluateEquipmentItem(
            slot.objectType,
            inventory,
            (category) => this.thresholdFor(category),
          );
          if (!evaluated) continue;
          consider({
            ...evaluated,
            container: section.container,
            slotId: slot.slotId,
            objectId: slot.objectId,
            key,
          });
        }
      }
    } else {
      const snapshot = this.vaultSnapshot();
      if (!snapshot?.complete) return [];
      for (const section of GEAR_CONTAINERS) {
        const types = snapshot[section.snapshotKey] ?? [];
        const chests = snapshot.containers?.[section.chestsKey] ?? [];
        for (let slotId = 0; slotId < types.length; slotId++) {
          const objectType = Number(types[slotId] ?? -1);
          if (objectType < 0) continue;
          const key = slotKey(section.container, slotId);
          if ((this.blockedUntil.get(key) ?? 0) > now) continue;
          const evaluated = evaluateEquipmentItem(
            objectType,
            inventory,
            (category) => this.thresholdFor(category),
          );
          if (!evaluated) continue;
          const chest = chests.find((entry) => (
            slotId >= entry.startSlot && slotId < entry.startSlot + entry.slotCount
          ));
          consider({
            ...evaluated,
            container: section.container,
            slotId,
            objectId: chest?.objectId ?? snapshot.objectIds?.[section.objectIdKey] ?? -1,
            key,
          });
        }
      }
    }

    for (const candidate of bestBySlot.values()) candidates.push(candidate);
    candidates.sort(compareEquipmentCandidates);
    return candidates;
  }

  findLiveSlot(action) {
    const slots = Hive.inventory.getContainerSlots(action.container) ?? [];
    const exact = slots.find((slot) => (
      slot.slotId === action.slotId && slot.objectType === action.objectType
    ));
    if (exact) return { ...exact, container: action.container, key: action.key };

    const inventory = Hive.inventory.getAll();
    for (const section of GEAR_CONTAINERS) {
      for (const slot of Hive.inventory.getContainerSlots(section.container) ?? []) {
        if (slot.objectType !== action.objectType) continue;
        const key = slotKey(section.container, slot.slotId);
        if ((this.blockedUntil.get(key) ?? 0) > Date.now()) continue;
        const evaluated = evaluateEquipmentItem(
          slot.objectType,
          inventory,
          (category) => this.thresholdFor(category),
        );
        if (!evaluated?.upgrade) continue;
        if (evaluated.equipmentSlot !== action.equipmentSlot) continue;
        return { ...slot, container: section.container, key, info: evaluated.info };
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

  thresholdFor(category) {
    const key = EQUIPMENT[category].thresholdKey;
    const value = Number(this.controller.state[key]);
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 99;
  }

  firstEmptyInventorySlot(inventory = Hive.inventory.getAll()) {
    let maximum = 11;
    try {
      const backpack = Number(Hive.inventory.getBackpack?.() ?? 1) || 1;
      if (backpack >= 3) maximum = 27;
      else if (backpack >= 2) maximum = 19;
    } catch {
      // Main inventory remains usable when backpack state is unavailable.
    }
    for (let slot = 4; slot <= maximum; slot++) {
      if ((inventory[slot] ?? -1) < 0) return slot;
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

  finishUpgrade(action) {
    const itemName = action.info?.name ?? `item ${action.objectType}`;
    const oldName = action.equippedInfo?.name;
    const kept = action.preserveEquipped && oldName ? `; kept ${oldName}` : '';
    this.controller.appendActivity(`Vault upgrades: equipped ${itemName} (T${action.tier})${kept}`);
    if (action.key) this.blockedUntil.set(action.key, Date.now() + 500);
    this.active = null;
    if (this.findEligibleUpgrades().length === 0) this.clearActive();
  }

  block(action, reason) {
    if (action?.key) this.blockedUntil.set(action.key, Date.now() + BLOCK_MS);
    this.active = null;
    if (reason) this.controller.appendActivity(`Vault upgrades skipped: ${reason}`);
    if (this.findEligibleUpgrades().length === 0) this.clearActive();
  }

  clearActive(message) {
    this.active = null;
    this.activity = 'Equip Vault Upgrades';
    this.controller.state.equipVaultUpgradesActive = false;
    if (message) this.controller.appendActivity(message);
  }

  pruneBlocks() {
    const now = Date.now();
    for (const [key, until] of this.blockedUntil) {
      if (until <= now) this.blockedUntil.delete(key);
    }
  }
}
