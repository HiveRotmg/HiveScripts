import { Hive } from '@hive/sdk';

/** Guaranteed bag slots before backpack metadata is known. Half-open end = 12. */
export const BASE_INVENTORY_SLOT_IDS = Object.freeze([4, 5, 6, 7, 8, 9, 10, 11]);

function slotIdsForBackpackTier(tier) {
  const endExclusive = tier >= 3 ? 28 : tier >= 2 ? 20 : 12;
  const slotIds = [];
  for (let slot = 4; slot < endExclusive; slot++) slotIds.push(slot);
  return slotIds;
}

function capacityFromSlotIds(slotIds, backpackTier) {
  const ids = slotIds.length > 0 ? [...slotIds] : [...BASE_INVENTORY_SLOT_IDS];
  const tier = backpackTier >= 3 ? 3 : backpackTier >= 2 ? 2 : 1;
  return {
    firstSlot: 4,
    endExclusive: ids[ids.length - 1] + 1,
    slotIds: ids,
    hasBackpack: tier >= 2,
    hasBackpackExtender: tier >= 3,
    backpackTier: tier,
  };
}

/**
 * Authoritative carried-inventory capacity for the current character.
 * Prefer `Hive.inventory.getCapacity()` / `getUsableSlotIds()` from the bridge;
 * fall back to `getBackpack()` tiers; if unknown, only base slots 4–11.
 */
export function getInventoryCapacity() {
  try {
    if (typeof Hive.inventory.getCapacity === 'function') {
      const capacity = Hive.inventory.getCapacity();
      if (capacity?.slotIds?.length) {
        return capacityFromSlotIds(capacity.slotIds, capacity.backpackTier ?? (
          capacity.hasBackpackExtender ? 3 : capacity.hasBackpack ? 2 : 1
        ));
      }
    }
  } catch {
    // Fall through to tier / base defaults.
  }

  try {
    if (typeof Hive.inventory.getUsableSlotIds === 'function') {
      const slotIds = Hive.inventory.getUsableSlotIds();
      if (Array.isArray(slotIds) && slotIds.length > 0) {
        const max = slotIds[slotIds.length - 1];
        const tier = max >= 27 ? 3 : max >= 19 ? 2 : 1;
        return capacityFromSlotIds(slotIds, tier);
      }
    }
  } catch {
    // Fall through.
  }

  try {
    const tier = Number(Hive.inventory.getBackpack?.() ?? 1) || 1;
    return capacityFromSlotIds(slotIdsForBackpackTier(tier), tier);
  } catch {
    return capacityFromSlotIds([...BASE_INVENTORY_SLOT_IDS], 1);
  }
}

export function getUsableInventorySlotIds() {
  return getInventoryCapacity().slotIds;
}

/** @deprecated Prefer getInventoryCapacity().endExclusive - 1 only when iterating inclusively. */
export function carriedMaximumSlot() {
  return getInventoryCapacity().endExclusive - 1;
}

export function isUsableInventorySlot(slotId) {
  const slot = Math.trunc(Number(slotId));
  return getInventoryCapacity().slotIds.includes(slot);
}

export function findFirstEmptyInventorySlot(inventory = Hive.inventory.getAll()) {
  for (const slotId of getUsableInventorySlotIds()) {
    if ((inventory[slotId] ?? -1) < 0) return slotId;
  }
  return null;
}

/** Alias matching older callers. */
export function firstEmptyInventorySlot(inventory = Hive.inventory.getAll()) {
  return findFirstEmptyInventorySlot(inventory);
}

export function getOccupiedInventorySlots(inventory = Hive.inventory.getAll()) {
  return getUsableInventorySlotIds().filter((slotId) => (inventory[slotId] ?? -1) >= 0);
}

export function isInventoryFull(inventory = Hive.inventory.getAll()) {
  return findFirstEmptyInventorySlot(inventory) === null;
}
