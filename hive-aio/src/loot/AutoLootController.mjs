import { Hive } from '@hive/sdk';
import { isRealmMap } from '../world/map-kind.mjs';

const EQUIPMENT = Object.freeze({
  weapon: { slot: 0, thresholdKey: 'minKeepWeaponTier' },
  ability: { slot: 1, thresholdKey: 'minKeepAbilityTier' },
  armor: { slot: 2, thresholdKey: 'minKeepArmorTier' },
  ring: { slot: 3, thresholdKey: 'minKeepRingTier' },
});

const ACTION_DELAY_MS = 200;
const ACTION_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 3000;

function numericTier(item) {
  const value = String(item?.tier ?? '').trim();
  return /^\d+$/.test(value) ? Number(value) : null;
}

function itemKey(bagObjectId, slotIndex) {
  return `${bagObjectId}:${slotIndex}`;
}

export class AutoLootController {
  constructor(controller) {
    this.controller = controller;
    this.active = null;
    this.blockedUntil = new Map();
  }

  reset() {
    this.active = null;
    this.blockedUntil.clear();
  }

  isActive() {
    return this.active !== null;
  }

  onLoop() {
    const { state } = this.controller;
    if (!state.automationRunning || !state.autoLootEnabled || !isRealmMap()) {
      this.active = null;
      return null;
    }

    if (this.active) return this.continueActive();

    const plan = this.findPlan();
    if (!plan) return null;

    Hive.walking.stopMoving();
    this.active = {
      ...plan,
      phase: 'approach',
      startedAt: Date.now(),
    };
    return this.continueActive();
  }

  findPlan() {
    const now = Date.now();
    for (const [key, until] of this.blockedUntil) {
      if (until <= now) this.blockedUntil.delete(key);
    }

    const inventory = Hive.inventory.getAll();
    const emptySlot = this.firstEmptyInventorySlot(inventory);
    const candidates = [];

    for (const bag of Hive.loot.getBags()) {
      const distance = Hive.self.distanceTo(bag.position);
      for (const item of bag.items) {
        if ((this.blockedUntil.get(itemKey(bag.objectId, item.slotIndex)) ?? 0) > now) continue;

        const info = Hive.loot.getItemInfo(item.objectType);
        const category = info?.slotType;
        const equipment = EQUIPMENT[category];
        const tier = numericTier(info);
        if (!equipment || tier === null) continue;

        const threshold = this.thresholdFor(category);
        const equippedObjectType = inventory[equipment.slot] ?? -1;
        const equippedInfo = equippedObjectType > 0
          ? Hive.loot.getItemInfo(equippedObjectType)
          : null;
        const equippedTier = numericTier(equippedInfo);
        const compatible = Hive.self.canEquip(item.objectType);
        const upgrade = compatible && (
          equippedObjectType <= 0
          || (equippedTier !== null && tier > equippedTier)
        );
        const keepByTier = tier >= threshold;
        if (!upgrade && !keepByTier) continue;

        const enchantmentCount = upgrade
          ? (Hive.inventory.getEnchantments(equipment.slot)?.typeIds?.length ?? 0)
          : 0;
        const preserveEquipped = upgrade && equippedObjectType > 0 && (
          enchantmentCount >= 3
          || (equippedTier !== null && equippedTier >= threshold)
        );
        const requiresBuffer = !upgrade || preserveEquipped;
        if (requiresBuffer && emptySlot === null) continue;

        candidates.push({
          bag,
          item,
          info,
          category,
          tier,
          upgrade,
          keepByTier,
          equipmentSlot: equipment.slot,
          equippedObjectType,
          equippedInfo,
          preserveEquipped,
          requiresBuffer,
          destinationSlot: requiresBuffer ? emptySlot : equipment.slot,
          distance,
        });
      }
    }

    candidates.sort((a, b) =>
      Number(b.upgrade) - Number(a.upgrade)
      || a.distance - b.distance
      || b.tier - a.tier
      || a.item.slotIndex - b.item.slotIndex);
    return candidates[0] ?? null;
  }

  continueActive() {
    const action = this.active;
    const inventory = Hive.inventory.getAll();

    if (action.phase === 'approach') {
      const liveBag = Hive.loot.getBags().find((bag) => bag.objectId === action.bag.objectId);
      const liveItem = liveBag?.items.find((item) =>
        item.slotIndex === action.item.slotIndex && item.objectType === action.item.objectType);
      if (!liveBag || !liveItem) {
        this.block(action, 'bag or item disappeared');
        return ACTION_DELAY_MS;
      }
      action.bag = liveBag;
      action.item = liveItem;

      if (Hive.self.distanceTo(liveBag.position) > 1) {
        Hive.walking.pathfindingWalkTo(liveBag.position.x, liveBag.position.y);
      } else {
        Hive.walking.stopMoving();
        const sent = Hive.loot.pickupToSlot(liveBag, liveItem.slotIndex, action.destinationSlot);
        if (!sent) {
          this.block(action, 'pickup command was rejected');
          return ACTION_DELAY_MS;
        }
        action.phase = action.upgrade && action.requiresBuffer
          ? 'wait-buffer'
          : 'wait-destination';
        action.startedAt = Date.now();
      }
    } else if (action.phase === 'wait-buffer') {
      if (inventory[action.destinationSlot] === action.item.objectType) {
        if (inventory[action.equipmentSlot] !== action.equippedObjectType) {
          this.finish(action, false, 'equipped item changed before the upgrade');
          return ACTION_DELAY_MS;
        }
        Hive.inventory.swapSlots(action.destinationSlot, action.equipmentSlot);
        action.phase = 'wait-equipped';
        action.startedAt = Date.now();
        return ACTION_DELAY_MS;
      }
    } else if (action.phase === 'wait-equipped') {
      if (inventory[action.equipmentSlot] === action.item.objectType) {
        this.finish(action, true);
        return ACTION_DELAY_MS;
      }
    } else if (inventory[action.destinationSlot] === action.item.objectType) {
      this.finish(action, true);
      return ACTION_DELAY_MS;
    }

    if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, 'inventory update timed out');
    }
    return ACTION_DELAY_MS;
  }

  finish(action, success, reason = '') {
    this.active = null;
    if (!success) {
      this.block(action, reason);
      return;
    }

    this.blockedUntil.set(
      itemKey(action.bag.objectId, action.item.slotIndex),
      Date.now() + RETRY_DELAY_MS,
    );

    const itemName = action.info?.name ?? `item ${action.item.objectType}`;
    if (!action.upgrade) {
      this.controller.appendActivity(`Looted ${itemName} (T${action.tier})`);
      return;
    }

    const oldName = action.equippedInfo?.name;
    const kept = action.preserveEquipped && oldName ? `; kept ${oldName}` : '';
    this.controller.appendActivity(`Equipped ${itemName} (T${action.tier})${kept}`);
  }

  block(action, reason) {
    const key = itemKey(action.bag.objectId, action.item.slotIndex);
    this.blockedUntil.set(key, Date.now() + RETRY_DELAY_MS);
    this.active = null;
    if (reason) this.controller.appendActivity(`Loot skipped: ${reason}`);
  }

  thresholdFor(category) {
    const key = EQUIPMENT[category].thresholdKey;
    const value = Number(this.controller.state[key]);
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 99;
  }

  firstEmptyInventorySlot(inventory) {
    let maximum = 11;
    try {
      if (Hive.inventory.getBackpack() >= 2) maximum = 19;
    } catch {
      // Main inventory is still usable when backpack state is unavailable.
    }
    for (let slot = 4; slot <= maximum; slot++) {
      if ((inventory[slot] ?? -1) < 0) return slot;
    }
    return null;
  }
}

export { numericTier };
