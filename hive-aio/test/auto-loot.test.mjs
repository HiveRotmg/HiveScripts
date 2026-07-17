import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { AutoLootController } from '../src/loot/AutoLootController.mjs';
import { ScriptState } from '../src/state/ScriptState.mjs';
import { mockInventoryCapacity } from './helpers/mock-inventory-capacity.mjs';

function gear(id, name, tier, slotType = 'weapon') {
  return { id, name, tier: String(tier), slotType };
}

function ring(id, stat, tier) {
  return gear(id, `Ring of ${stat}`, tier, 'ring');
}

function setup({
  equipped = [-1, -1, -1, -1],
  metadata = [],
  bagItems = [],
  compatible = [],
  enchantments = {},
  bagPosition = { x: 0, y: 0 },
  inventoryFill = [],
  backpack = 1,
} = {}) {
  const state = new ScriptState();
  state.automationRunning = true;
  state.autoLootEnabled = true;
  const activity = [];
  const controller = {
    state,
    appendActivity(message) { activity.push(message); },
  };
  const autoLoot = new AutoLootController(controller);
  const inventory = new Array(28).fill(-1);
  equipped.forEach((item, slot) => { inventory[slot] = item; });
  inventoryFill.forEach((item, index) => { inventory[index + 4] = item; });
  const itemInfo = new Map(metadata.map((item) => [item.id, item]));
  const bag = {
    objectId: 500,
    position: bagPosition,
    items: bagItems.map((item, slotIndex) => ({ objectType: item, slotIndex })),
  };
  const position = { x: 0, y: 0 };
  const swaps = [];
  const walks = [];

  Hive.world.getName = () => 'Realm of the Mad God';
  Hive.self.distanceTo = (target) => Math.hypot(target.x - position.x, target.y - position.y);
  Hive.self.canEquip = (objectType) => compatible.includes(objectType);
  Hive.inventory.getAll = () => [...inventory];
  mockInventoryCapacity(Hive, backpack);
  Hive.inventory.getEnchantments = (slot) => enchantments[slot] ?? null;
  Hive.inventory.swapSlots = (from, to) => {
    swaps.push([from, to]);
    [inventory[from], inventory[to]] = [inventory[to], inventory[from]];
  };
  Hive.loot.getBags = () => [bag];
  Hive.loot.getItemInfo = (objectType) => itemInfo.get(objectType) ?? null;
  Hive.loot.pickupToSlot = (_bag, bagSlot, destination) => {
    const source = bag.items.find((item) => item.slotIndex === bagSlot);
    if (!source) return false;
    const replaced = inventory[destination];
    inventory[destination] = source.objectType;
    if (replaced > 0) {
      bag.items = bag.items.map((item) => item === source
        ? { ...item, objectType: replaced }
        : item);
    }
    else bag.items = bag.items.filter((item) => item !== source);
    return true;
  };
  Hive.walking.stopMoving = () => {};
  Hive.walking.pathfindingWalkTo = (x, y) => {
    walks.push({ x, y });
    return true;
  };

  return { state, autoLoot, activity, inventory, bag, position, swaps, walks };
}

test('auto loot interrupts movement, walks to a bag, and directly equips an ordinary upgrade', () => {
  const ctx = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'T1 Staff', 1), gear(102, 'T2 Staff', 2)],
    bagItems: [102],
    compatible: [102],
    bagPosition: { x: 3, y: 4 },
  });

  assert.equal(ctx.autoLoot.onLoop(), 200);
  assert.deepEqual(ctx.walks, [{ x: 3, y: 4 }]);
  assert.equal(ctx.inventory[0], 101);

  ctx.position.x = 3;
  ctx.position.y = 4;
  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();

  assert.equal(ctx.inventory[0], 102);
  assert.equal(ctx.bag.items[0].objectType, 101);
  assert.equal(ctx.autoLoot.isActive(), false);
  assert.match(ctx.activity[0], /Equipped T2 Staff/);
});

test('auto loot preserves replaced equipment with at least three enchantments', () => {
  const ctx = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'Rare T1 Staff', 1), gear(102, 'T2 Staff', 2)],
    bagItems: [102],
    compatible: [102],
    enchantments: { 0: { typeIds: [10, 20, 30] } },
  });

  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();

  assert.equal(ctx.inventory[0], 102);
  assert.equal(ctx.inventory[4], 101);
  assert.deepEqual(ctx.swaps, [[4, 0]]);
  assert.match(ctx.activity[0], /kept Rare T1 Staff/);
});

test('incompatible gear is ignored below its keep tier and collected at the threshold', () => {
  const ctx = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'T5 Staff', 5), gear(202, 'T8 Dagger', 8)],
    bagItems: [202],
    compatible: [],
  });

  assert.equal(ctx.autoLoot.onLoop(), null);
  assert.equal(ctx.inventory[4], -1);

  ctx.state.minKeepWeaponTier = 8;
  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();

  assert.equal(ctx.inventory[0], 101);
  assert.equal(ctx.inventory[4], 202);
  assert.match(ctx.activity[0], /Looted T8 Dagger/);
});

test('untiered equipped gear is never replaced, but qualifying tiered loot is retained', () => {
  const ignored = setup({
    equipped: [301, -1, -1, -1],
    metadata: [gear(301, 'UT Staff', 'UT'), gear(302, 'T8 Staff', 8)],
    bagItems: [302],
    compatible: [302],
  });

  assert.equal(ignored.autoLoot.onLoop(), null);
  assert.equal(ignored.inventory[0], 301);

  ignored.state.minKeepWeaponTier = 8;
  ignored.autoLoot.onLoop();
  ignored.autoLoot.onLoop();
  assert.equal(ignored.inventory[0], 301);
  assert.equal(ignored.inventory[4], 302);
});

test('equal-tier loot at the keep threshold is carried instead of replacing equipment', () => {
  const ctx = setup({
    equipped: [501, -1, -1, -1],
    metadata: [gear(501, 'Equipped T12 Staff', 12), gear(502, 'Spare T12 Staff', 12)],
    bagItems: [502],
    compatible: [502],
  });

  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();

  assert.equal(ctx.inventory[0], 501);
  assert.equal(ctx.inventory[4], 502);
});

test('replaced tiered gear at the keep threshold is preserved without enchantments', () => {
  const ctx = setup({
    equipped: [501, -1, -1, -1],
    metadata: [gear(501, 'T12 Staff', 12), gear(503, 'T13 Staff', 13)],
    bagItems: [503],
    compatible: [503],
  });

  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();
  ctx.autoLoot.onLoop();

  assert.equal(ctx.inventory[0], 503);
  assert.equal(ctx.inventory[4], 501);
});

test('a full inventory still permits an unprotected direct upgrade but blocks a protected one', () => {
  const full = [401, 402, 403, 404, 405, 406, 407, 408];
  const direct = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'T1 Staff', 1), gear(102, 'T2 Staff', 2)],
    bagItems: [102],
    compatible: [102],
    inventoryFill: full,
  });

  direct.autoLoot.onLoop();
  direct.autoLoot.onLoop();
  assert.equal(direct.inventory[0], 102);

  const protectedGear = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'Rare T1 Staff', 1), gear(102, 'T2 Staff', 2)],
    bagItems: [102],
    compatible: [102],
    enchantments: { 0: { typeIds: [1, 2, 3] } },
    inventoryFill: full,
  });

  assert.equal(protectedGear.autoLoot.onLoop(), null);
  assert.equal(protectedGear.inventory[0], 101);
});

test('auto loot uses backpack extender slots when buffering a protected upgrade', () => {
  const inventoryFill = [];
  for (let slot = 4; slot <= 19; slot++) inventoryFill[slot - 4] = 1000 + slot;

  const ctx = setup({
    equipped: [101, -1, -1, -1],
    metadata: [gear(101, 'Rare T1 Staff', 1), gear(102, 'T2 Staff', 2)],
    bagItems: [102],
    compatible: [102],
    enchantments: { 0: { typeIds: [1, 2, 3] } },
    inventoryFill,
    backpack: 3,
  });

  // Already in range: withdraw into extender slot 20, then equip.
  ctx.autoLoot.onLoop();
  assert.equal(ctx.inventory[20], 102);
  assert.equal(ctx.inventory[0], 101);

  ctx.autoLoot.onLoop();
  assert.equal(ctx.inventory[0], 102);
  assert.equal(ctx.inventory[20], 101);
});

test('same-tier attack and dexterity rings replace lower-priority rings', () => {
  for (const preferredStat of ['Attack', 'Dexterity']) {
    const ctx = setup({
      equipped: [-1, -1, -1, 601],
      metadata: [ring(601, 'Speed', 5), ring(602, preferredStat, 5)],
      bagItems: [602],
      compatible: [602],
    });

    ctx.autoLoot.onLoop();
    ctx.autoLoot.onLoop();
    assert.equal(ctx.inventory[3], 602, `${preferredStat} should replace same-tier Speed`);
  }
});

test('same-tier health rings replace low-priority rings but not attack or dexterity', () => {
  const replacesSpeed = setup({
    equipped: [-1, -1, -1, 611],
    metadata: [ring(611, 'Speed', 5), ring(612, 'Health', 5)],
    bagItems: [612],
    compatible: [612],
  });
  replacesSpeed.autoLoot.onLoop();
  replacesSpeed.autoLoot.onLoop();
  assert.equal(replacesSpeed.inventory[3], 612);

  const keepsAttack = setup({
    equipped: [-1, -1, -1, 613],
    metadata: [ring(613, 'Attack', 5), ring(614, 'Health', 5)],
    bagItems: [614],
    compatible: [614],
  });
  assert.equal(keepsAttack.autoLoot.onLoop(), null);
  assert.equal(keepsAttack.inventory[3], 613);
});

test('a one-tier-higher speed, wisdom, or vitality ring does not replace a better ring', () => {
  for (const weakStat of ['Speed', 'Wisdom', 'Vitality']) {
    const ctx = setup({
      equipped: [-1, -1, -1, 621],
      metadata: [ring(621, 'Dexterity', 4), ring(622, weakStat, 5)],
      bagItems: [622],
      compatible: [622],
    });

    assert.equal(ctx.autoLoot.onLoop(), null, `${weakStat} should not replace one-tier-lower Dexterity`);
    assert.equal(ctx.inventory[3], 621);
  }
});

test('health, attack, and dexterity rings upgrade by one tier', () => {
  for (const preferredStat of ['Health', 'Attack', 'Dexterity']) {
    const ctx = setup({
      equipped: [-1, -1, -1, 631],
      metadata: [ring(631, 'Dexterity', 4), ring(632, preferredStat, 5)],
      bagItems: [632],
      compatible: [632],
    });

    ctx.autoLoot.onLoop();
    ctx.autoLoot.onLoop();
    assert.equal(ctx.inventory[3], 632, `${preferredStat} should upgrade by one tier`);
  }
});

test('ring candidate selection prefers attack or dexterity over a same-tier weak ring', () => {
  const ctx = setup({
    metadata: [ring(641, 'Speed', 5), ring(642, 'Attack', 5)],
    bagItems: [641, 642],
    compatible: [641, 642],
  });

  const plan = ctx.autoLoot.findPlan();
  assert.equal(plan?.item.objectType, 642);
});
