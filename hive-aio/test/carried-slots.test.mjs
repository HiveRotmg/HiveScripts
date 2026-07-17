import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import {
  BASE_INVENTORY_SLOT_IDS,
  carriedMaximumSlot,
  findFirstEmptyInventorySlot,
  firstEmptyInventorySlot,
  getInventoryCapacity,
  getOccupiedInventorySlots,
  getUsableInventorySlotIds,
  isInventoryFull,
  isUsableInventorySlot,
} from '../src/inventory/carried-slots.mjs';

const NO_BACKPACK = [4, 5, 6, 7, 8, 9, 10, 11];
const WITH_BACKPACK = [...NO_BACKPACK, 12, 13, 14, 15, 16, 17, 18, 19];
const WITH_EXTENDER = [...WITH_BACKPACK, 20, 21, 22, 23, 24, 25, 26, 27];

function clearCapacityMocks() {
  delete Hive.inventory.getCapacity;
  delete Hive.inventory.getUsableSlotIds;
  delete Hive.inventory.getBackpack;
}

function mockCapacityFromTier(tier) {
  clearCapacityMocks();
  const slotIds = tier >= 3 ? WITH_EXTENDER : tier >= 2 ? WITH_BACKPACK : NO_BACKPACK;
  const endExclusive = slotIds[slotIds.length - 1] + 1;
  Hive.inventory.getCapacity = () => ({
    firstSlot: 4,
    endExclusive,
    slotIds: [...slotIds],
    hasBackpack: tier >= 2,
    hasBackpackExtender: tier >= 3,
    backpackTier: tier,
  });
  Hive.inventory.getUsableSlotIds = () => [...slotIds];
  Hive.inventory.getBackpack = () => tier;
}

function filledUsable(slotIds, emptySlot = null) {
  const inventory = new Array(28).fill(-1);
  for (let slot = 0; slot < 4; slot++) inventory[slot] = -1;
  for (const slot of slotIds) {
    inventory[slot] = emptySlot === slot ? -1 : 1000 + slot;
  }
  return inventory;
}

test('no backpack: usable slots are exactly 4–11', () => {
  mockCapacityFromTier(1);
  assert.deepEqual(getUsableInventorySlotIds(), NO_BACKPACK);
  assert.equal(getInventoryCapacity().endExclusive, 12);
  assert.equal(isUsableInventorySlot(11), true);
  assert.equal(isUsableInventorySlot(12), false);
  assert.equal(isUsableInventorySlot(0), false);
  assert.equal(isUsableInventorySlot(3), false);
  assert.equal(isUsableInventorySlot(28), false);

  const full = filledUsable(NO_BACKPACK);
  assert.equal(isInventoryFull(full), true);
  assert.equal(findFirstEmptyInventorySlot(full), null);
  assert.equal(getOccupiedInventorySlots(full).length, 8);

  full[11] = -1;
  assert.equal(findFirstEmptyInventorySlot(full), 11);
  assert.equal(isInventoryFull(full), false);
});

test('backpack: usable slots are exactly 4–19', () => {
  mockCapacityFromTier(2);
  assert.deepEqual(getUsableInventorySlotIds(), WITH_BACKPACK);
  assert.equal(getInventoryCapacity().endExclusive, 20);
  assert.equal(isUsableInventorySlot(19), true);
  assert.equal(isUsableInventorySlot(20), false);
  assert.equal(isUsableInventorySlot(12), true);

  const occupiedBase = filledUsable(NO_BACKPACK);
  assert.equal(isInventoryFull(occupiedBase), false);
  assert.equal(findFirstEmptyInventorySlot(occupiedBase), 12);

  const full = filledUsable(WITH_BACKPACK);
  assert.equal(isInventoryFull(full), true);
  full[19] = -1;
  assert.equal(findFirstEmptyInventorySlot(full), 19);
});

test('backpack plus extender: usable slots are exactly 4–27', () => {
  mockCapacityFromTier(3);
  assert.deepEqual(getUsableInventorySlotIds(), WITH_EXTENDER);
  assert.equal(getInventoryCapacity().endExclusive, 28);
  assert.equal(isUsableInventorySlot(27), true);
  assert.equal(isUsableInventorySlot(28), false);
  assert.equal(isUsableInventorySlot(20), true);

  const occupiedThroughBackpack = filledUsable(WITH_BACKPACK);
  assert.equal(isInventoryFull(occupiedThroughBackpack), false);
  assert.equal(findFirstEmptyInventorySlot(occupiedThroughBackpack), 20);

  const full = filledUsable(WITH_EXTENDER);
  assert.equal(isInventoryFull(full), true);
  full[27] = -1;
  assert.equal(findFirstEmptyInventorySlot(full), 27);
});

test('equipment slots are never returned as empty inventory slots', () => {
  mockCapacityFromTier(3);
  const inventory = filledUsable(WITH_EXTENDER);
  for (let slot = 0; slot < 4; slot++) inventory[slot] = -1;
  assert.equal(findFirstEmptyInventorySlot(inventory), null);
  assert.equal(isUsableInventorySlot(0), false);
  assert.equal(isUsableInventorySlot(1), false);
  assert.equal(isUsableInventorySlot(2), false);
  assert.equal(isUsableInventorySlot(3), false);
});

test('unknown backpack state uses only guaranteed base slots 4–11', () => {
  clearCapacityMocks();
  Hive.inventory.getBackpack = () => {
    throw new Error('unavailable');
  };
  assert.deepEqual(getUsableInventorySlotIds(), [...BASE_INVENTORY_SLOT_IDS]);
  assert.equal(getInventoryCapacity().hasBackpack, false);
  assert.equal(getInventoryCapacity().hasBackpackExtender, false);
  assert.equal(isUsableInventorySlot(12), false);
  assert.equal(carriedMaximumSlot(), 11);
});

test('capacity changes after character load / backpack unlock', () => {
  mockCapacityFromTier(1);
  assert.deepEqual(getUsableInventorySlotIds(), NO_BACKPACK);

  mockCapacityFromTier(2);
  assert.deepEqual(getUsableInventorySlotIds(), WITH_BACKPACK);

  mockCapacityFromTier(3);
  assert.deepEqual(getUsableInventorySlotIds(), WITH_EXTENDER);
});

test('falls back to getBackpack tiers when getCapacity is absent', () => {
  clearCapacityMocks();
  Hive.inventory.getBackpack = () => 2;
  assert.deepEqual(getUsableInventorySlotIds(), WITH_BACKPACK);

  Hive.inventory.getBackpack = () => 3;
  assert.deepEqual(getUsableInventorySlotIds(), WITH_EXTENDER);
});

test('prefers getUsableSlotIds when getCapacity is missing', () => {
  clearCapacityMocks();
  Hive.inventory.getUsableSlotIds = () => [...WITH_EXTENDER];
  Hive.inventory.getBackpack = () => 1;
  assert.deepEqual(getUsableInventorySlotIds(), WITH_EXTENDER);
  assert.equal(getInventoryCapacity().backpackTier, 3);
});

test('off-by-one boundaries at slots 12, 20, and 28', () => {
  mockCapacityFromTier(1);
  assert.equal(isUsableInventorySlot(11), true);
  assert.equal(isUsableInventorySlot(12), false);

  mockCapacityFromTier(2);
  assert.equal(isUsableInventorySlot(19), true);
  assert.equal(isUsableInventorySlot(20), false);

  mockCapacityFromTier(3);
  assert.equal(isUsableInventorySlot(27), true);
  assert.equal(isUsableInventorySlot(28), false);

  const inventory = filledUsable(WITH_BACKPACK);
  inventory[20] = -1;
  mockCapacityFromTier(2);
  assert.equal(firstEmptyInventorySlot(inventory), null);
  mockCapacityFromTier(3);
  assert.equal(firstEmptyInventorySlot(inventory), 20);
});
