import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { DrinkVaultPotionsController } from '../src/loot/DrinkVaultPotionsController.mjs';
import { ScriptState } from '../src/state/ScriptState.mjs';

const ATTACK_POTION = 2591;

function setup({
  inventory = new Array(28).fill(-1),
  potionSlots,
  vaultSlots,
  base = { attack: 10 },
  caps = { attack: 75 },
  mapName = 'Vault',
} = {}) {
  const state = new ScriptState();
  state.automationRunning = true;
  state.vaultOnStartDone = true;
  state.drinkVaultPotionsEnabled = true;
  const activity = [];
  const controller = {
    state,
    appendActivity(message) { activity.push(message); },
  };
  const drink = new DrinkVaultPotionsController(controller);
  const calls = {
    nexus: 0,
    enterVault: 0,
    swaps: [],
    uses: [],
    walks: [],
    stops: 0,
  };
  let currentMap = mapName;
  const storage = {
    potionVault: potionSlots ?? [
      { objectId: 200, slotId: 0, objectType: ATTACK_POTION },
    ],
    vault: vaultSlots ?? [
      { objectId: 300, slotId: 0, objectType: -1 },
    ],
  };
  let liveBase = { ...base };

  Hive.world.getName = () => currentMap;
  Hive.world.isNexus = () => currentMap === 'Nexus';
  Hive.world.objects = {
    getById: (objectId) => (objectId === 200 ? { position: { x: 10, y: 10 } } : null),
  };
  Hive.self.distanceTo = () => 0.5;
  Hive.self.getBaseStats = () => ({ ...liveBase });
  Hive.self.getStatCaps = () => ({ ...caps });
  Hive.inventory.getAll = () => [...inventory];
  Hive.inventory.getBackpack = () => 1;
  Hive.inventory.getContainerSlots = (container) => storage[container] ?? [];
  Hive.inventory.getVaultSnapshot = () => ({
    active: currentMap === 'Vault',
    complete: true,
    potion: (storage.potionVault ?? []).map((slot) => slot.objectType),
    vault: (storage.vault ?? []).map((slot) => slot.objectType),
    containers: {
      potion: [{ objectId: 200, startSlot: 0, slotCount: storage.potionVault.length, enchantments: '' }],
      vault: [{ objectId: 300, startSlot: 0, slotCount: storage.vault.length, enchantments: '' }],
    },
    objectIds: { potion: 200, vault: 300 },
  });
  Hive.inventory.swapContainers = (from, to) => {
    calls.swaps.push({ from, to });
    if (from.container === 'potionVault' || from.container === 'vault') {
      const source = storage[from.container][from.slotId];
      inventory[to.slotId] = source.objectType;
      source.objectType = -1;
    }
    return true;
  };
  Hive.inventory.useItem = (slot) => {
    calls.uses.push(slot);
    inventory[slot] = -1;
    liveBase.attack = Math.min(caps.attack, (liveBase.attack || 0) + 1);
  };
  Hive.loot.getItemInfo = (objectType) => objectType === ATTACK_POTION
    ? { name: 'Potion of Attack' }
    : { name: `Item ${objectType}` };
  Hive.walking.stopMoving = () => { calls.stops++; };
  Hive.walking.nexus = () => { calls.nexus++; };
  Hive.walking.enterVault = () => { calls.enterVault++; };
  Hive.walking.pathfindingWalkTo = (x, y) => {
    calls.walks.push({ x, y });
    return true;
  };

  return {
    state,
    drink,
    activity,
    inventory,
    storage,
    calls,
    setMap(name) { currentMap = name; },
    setBase(next) { liveBase = { ...next }; },
  };
}

test('does nothing when disabled or when no eligible potions remain', () => {
  const ctx = setup({
    potionSlots: [{ objectId: 200, slotId: 0, objectType: ATTACK_POTION }],
    base: { attack: 75 },
    caps: { attack: 75 },
  });
  assert.equal(ctx.drink.onLoop(), null);
  assert.equal(ctx.state.drinkVaultPotionsActive, false);

  ctx.setBase({ attack: 10 });
  ctx.state.drinkVaultPotionsEnabled = false;
  assert.equal(ctx.drink.onLoop(), null);
  assert.equal(ctx.state.drinkVaultPotionsActive, false);
});

test('from another map, nexuses while keeping drink intent sticky', () => {
  const ctx = setup({ mapName: 'Realm of the Mad God' });
  assert.equal(ctx.drink.onLoop(), 200);
  assert.equal(ctx.state.drinkVaultPotionsActive, true);
  assert.equal(ctx.calls.nexus, 1);
  assert.match(ctx.activity.at(-1), /returning to Nexus/i);
});

test('in Nexus, keeps intent active and leaves Vault entry to the tree', () => {
  const ctx = setup({ mapName: 'Nexus' });
  assert.equal(ctx.drink.onLoop(), null);
  assert.equal(ctx.state.drinkVaultPotionsActive, true);
  assert.equal(ctx.calls.enterVault, 0);
});

test('in Vault, withdraws then drinks an unmaxed attack potion', () => {
  const ctx = setup();
  assert.equal(ctx.drink.onLoop(), 200);
  assert.equal(ctx.state.drinkVaultPotionsActive, true);
  assert.equal(ctx.calls.swaps.length, 1);
  assert.equal(ctx.inventory[4], ATTACK_POTION);

  assert.equal(ctx.drink.onLoop(), 200);
  assert.deepEqual(ctx.calls.uses, [4]);
  assert.equal(ctx.inventory[4], -1);

  assert.equal(ctx.drink.onLoop(), null);
  assert.equal(ctx.state.drinkVaultPotionsActive, false);
  assert.match(ctx.activity.join('\n'), /drank Potion of Attack/i);
});

test('skips maxed stats and stops cleanly when inventory is full', () => {
  const fullInventory = new Array(28).fill(1);
  const ctx = setup({
    inventory: fullInventory,
    potionSlots: [
      { objectId: 200, slotId: 0, objectType: ATTACK_POTION },
    ],
  });
  assert.equal(ctx.drink.onLoop(), 200);
  assert.equal(ctx.calls.swaps.length, 0);
  assert.equal(ctx.state.drinkVaultPotionsActive, false);
  assert.match(ctx.activity.join('\n'), /inventory full/i);

  // Remains stopped until an inventory slot opens.
  assert.equal(ctx.drink.onLoop(), null);
});

test('does not plan more potions than remaining need', () => {
  const ctx = setup({
    potionSlots: [
      { objectId: 200, slotId: 0, objectType: ATTACK_POTION },
      { objectId: 200, slotId: 1, objectType: ATTACK_POTION },
      { objectId: 200, slotId: 2, objectType: ATTACK_POTION },
    ],
    base: { attack: 74 },
    caps: { attack: 75 },
  });
  const eligible = ctx.drink.findEligiblePotions();
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].slotId, 0);
});
