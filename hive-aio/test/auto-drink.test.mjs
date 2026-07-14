import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { AutoDrinkController, potionStat } from '../src/loot/AutoDrinkController.mjs';
import { ScriptState } from '../src/state/ScriptState.mjs';

function setup({
  attack = 40,
  attackCap = 50,
  bagX = 0,
  potionName = 'Potion of Attack',
  autoDrinkEnabled = true,
  pickupPotionsEnabled = false,
  backpackTier = 1,
  inventory = Array(28).fill(-1),
} = {}) {
  const state = new ScriptState();
  state.automationRunning = true;
  state.autoDrinkEnabled = autoDrinkEnabled;
  state.pickupPotionsEnabled = pickupPotionsEnabled;
  const activity = [];
  const position = { x: 0, y: 0 };
  const bag = {
    objectId: 500,
    position: { x: bagX, y: 0 },
    items: [{ objectType: 2591, slotIndex: 0 }],
  };
  const base = {
    maxHP: 700, maxMP: 250, attack, defense: 25,
    speed: 50, dexterity: 50, vitality: 40, wisdom: 40,
  };
  const caps = { ...base, attack: attackCap };
  const walks = [];
  const uses = [];
  const pickups = [];
  let autoLootResets = 0;
  const controller = {
    state,
    autoLoot: { reset() { autoLootResets++; } },
    appendActivity(message) { activity.push(message); },
  };
  const autoDrink = new AutoDrinkController(controller);

  Hive.self.getBaseStats = () => ({ ...base });
  Hive.self.getStatCaps = () => ({ ...caps });
  Hive.self.distanceTo = (target) => Math.hypot(target.x - position.x, target.y - position.y);
  Hive.loot.getBags = () => bag.items.length ? [bag] : [];
  Hive.loot.getItemInfo = () => ({ id: 2591, name: potionName, slotType: 'consumable' });
  Hive.loot.useFromBag = (_bag, slotIndex) => {
    uses.push(slotIndex);
    bag.items = [];
    base.attack++;
    return true;
  };
  Hive.loot.pickupToSlot = (_bag, slotIndex, destinationSlot) => {
    pickups.push({ slotIndex, destinationSlot });
    inventory[destinationSlot] = bag.items[0].objectType;
    bag.items = [];
    return true;
  };
  Hive.inventory.getAll = () => [...inventory];
  Hive.inventory.getBackpack = () => backpackTier;
  Hive.walking.stopMoving = () => {};
  Hive.walking.pathfindingWalkTo = (x, y) => {
    walks.push({ x, y });
    return true;
  };

  return {
    autoDrink, activity, position, bag, base, walks, uses, pickups, inventory,
    autoLootResets: () => autoLootResets,
  };
}

test('potion classifier recognizes normal, greater, and soulbound permanent stat potions', () => {
  assert.equal(potionStat({ name: 'Potion of Attack' })?.key, 'attack');
  assert.equal(potionStat({ name: 'Greater Potion of Life' })?.key, 'maxHP');
  assert.equal(potionStat({ name: 'Potion of Dexterity (SB)' })?.key, 'dexterity');
  assert.equal(potionStat({ name: 'Potion of Health' }), null);
});

test('AutoDrink walks to and consumes a potion when the base stat is below its class cap', () => {
  const ctx = setup({ bagX: 3 });

  assert.equal(ctx.autoDrink.onLoop(), 200);
  assert.deepEqual(ctx.walks, [{ x: 3, y: 0 }]);
  assert.equal(ctx.uses.length, 0);
  assert.equal(ctx.autoLootResets(), 1);

  ctx.position.x = 3;
  ctx.autoDrink.onLoop();
  ctx.autoDrink.onLoop();

  assert.deepEqual(ctx.uses, [0]);
  assert.equal(ctx.base.attack, 41);
  assert.match(ctx.activity.at(-1), /Drank Potion of Attack/);
});

test('AutoDrink leaves a potion alone when the corresponding base stat is maxed', () => {
  const ctx = setup({ attack: 50, attackCap: 50 });

  assert.equal(ctx.autoDrink.onLoop(), null);
  assert.equal(ctx.uses.length, 0);
  assert.equal(ctx.bag.items.length, 1);
});

test('AutoDrink does nothing when class cap information is unavailable', () => {
  const ctx = setup({ attack: 40, attackCap: 0 });

  assert.equal(ctx.autoDrink.onLoop(), null);
  assert.equal(ctx.uses.length, 0);
});

test('pickup-only mode stores a needed potion instead of drinking it', () => {
  const ctx = setup({ autoDrinkEnabled: false, pickupPotionsEnabled: true });

  ctx.autoDrink.onLoop();
  ctx.autoDrink.onLoop();

  assert.deepEqual(ctx.uses, []);
  assert.deepEqual(ctx.pickups, [{ slotIndex: 0, destinationSlot: 4 }]);
  assert.equal(ctx.inventory[4], 2591);
  assert.match(ctx.activity.at(-1), /Picked up Potion of Attack/);
});

test('combined mode drinks below cap and stores the potion once maxed', () => {
  const drinking = setup({ pickupPotionsEnabled: true });
  drinking.autoDrink.onLoop();
  drinking.autoDrink.onLoop();
  assert.deepEqual(drinking.uses, [0]);
  assert.deepEqual(drinking.pickups, []);

  const storing = setup({ attack: 50, attackCap: 50, pickupPotionsEnabled: true });
  storing.autoDrink.onLoop();
  storing.autoDrink.onLoop();
  assert.deepEqual(storing.uses, []);
  assert.deepEqual(storing.pickups, [{ slotIndex: 0, destinationSlot: 4 }]);
});

test('pickup uses backpack and extender slots only when unlocked', () => {
  const baseInventory = Array(28).fill(-1);
  for (let slot = 4; slot <= 19; slot++) baseInventory[slot] = 1000 + slot;

  const withoutExtender = setup({
    autoDrinkEnabled: false,
    pickupPotionsEnabled: true,
    backpackTier: 2,
    inventory: [...baseInventory],
  });
  assert.equal(withoutExtender.autoDrink.onLoop(), null);

  const withExtender = setup({
    autoDrinkEnabled: false,
    pickupPotionsEnabled: true,
    backpackTier: 3,
    inventory: [...baseInventory],
  });
  withExtender.autoDrink.onLoop();
  withExtender.autoDrink.onLoop();
  assert.deepEqual(withExtender.pickups, [{ slotIndex: 0, destinationSlot: 20 }]);
});
