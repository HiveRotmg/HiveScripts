/** Shared backpack/capacity mocks for Hive AIO inventory tests. */

const BASE = [4, 5, 6, 7, 8, 9, 10, 11];
const BACKPACK = [...BASE, 12, 13, 14, 15, 16, 17, 18, 19];
const EXTENDER = [...BACKPACK, 20, 21, 22, 23, 24, 25, 26, 27];

export function slotIdsForBackpackTier(tier) {
  if (tier >= 3) return [...EXTENDER];
  if (tier >= 2) return [...BACKPACK];
  return [...BASE];
}

/**
 * Explicitly declare backpack / extender capacity on Hive.inventory.
 * Prefer this over relying on accidental max capacity defaults.
 */
export function mockInventoryCapacity(Hive, backpackTier = 1) {
  const tier = backpackTier >= 3 ? 3 : backpackTier >= 2 ? 2 : 1;
  const slotIds = slotIdsForBackpackTier(tier);
  Hive.inventory.getBackpack = () => tier;
  Hive.inventory.getUsableSlotIds = () => [...slotIds];
  Hive.inventory.getCapacity = () => ({
    firstSlot: 4,
    endExclusive: slotIds[slotIds.length - 1] + 1,
    slotIds: [...slotIds],
    hasBackpack: tier >= 2,
    hasBackpackExtender: tier >= 3,
    backpackTier: tier,
  });
  return slotIds;
}
