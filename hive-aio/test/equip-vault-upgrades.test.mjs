import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { EquipVaultUpgradesController } from '../src/loot/EquipVaultUpgradesController.mjs';
import { ScriptState } from '../src/state/ScriptState.mjs';
import { resetAllVaultNavigation } from '../src/storage/navigate-to-vault.mjs';
import { mockInventoryCapacity } from './helpers/mock-inventory-capacity.mjs';

function gear(id, name, tier, slotType = 'weapon') {
  return { id, name, tier: String(tier), slotType };
}

function setup({
  equipped = [101, -1, -1, -1],
  vaultSlots,
  metadata = [gear(101, 'T1 Staff', 1), gear(102, 'T2 Staff', 2)],
  compatible = [102],
  enchantments = {},
  inventoryFill = [],
  mapName = 'Vault',
  backpackTier = 1,
} = {}) {
  resetAllVaultNavigation();
  const state = new ScriptState();
  state.automationRunning = true;
  state.vaultOnStartDone = true;
  state.equipVaultUpgradesEnabled = true;
  const activity = [];
  const controller = {
    state,
    appendActivity(message) { activity.push(message); },
  };
  const equip = new EquipVaultUpgradesController(controller);
  const inventory = new Array(28).fill(-1);
  equipped.forEach((item, slot) => { inventory[slot] = item; });
  inventoryFill.forEach((item, index) => { inventory[index + 4] = item; });
  const itemInfo = new Map(metadata.map((item) => [item.id, item]));
  const storage = {
    vault: vaultSlots ?? [
      { objectId: 300, slotId: 0, objectType: 102 },
    ],
    giftChest: [],
    spoilsChest: [],
    materialVault: [],
  };
  const calls = { nexus: 0, enterVault: 0, swaps: [], slotSwaps: [], walks: [] };
  let currentMap = mapName;

  Hive.world.getName = () => currentMap;
  Hive.world.isNexus = () => currentMap === 'Nexus';
  Hive.world.objects = {
    getById: (objectId) => (objectId === 300 ? { position: { x: 10, y: 10 } } : null),
  };
  Hive.self.distanceTo = () => 0.5;
  Hive.self.canEquip = (objectType) => compatible.includes(objectType);
  Hive.inventory.getAll = () => [...inventory];
  mockInventoryCapacity(Hive, backpackTier);
  Hive.inventory.getEnchantments = (slot) => enchantments[slot] ?? null;
  Hive.inventory.getContainerSlots = (container) => storage[container] ?? [];
  Hive.inventory.getVaultSnapshot = () => ({
    active: currentMap === 'Vault',
    complete: true,
    vault: (storage.vault ?? []).map((slot) => slot.objectType),
    gift: [],
    material: [],
    seasonalSpoils: [],
    containers: {
      vault: [{ objectId: 300, startSlot: 0, slotCount: storage.vault.length, enchantments: '' }],
      gift: [],
      material: [],
      seasonalSpoils: [],
    },
    objectIds: { vault: 300, gift: -1, material: -1, seasonalSpoils: -1 },
  });
  Hive.inventory.swapContainers = (from, to) => {
    calls.swaps.push({ from, to });
    if (from.container === 'vault') {
      const source = storage.vault[from.slotId];
      const replaced = inventory[to.slotId];
      inventory[to.slotId] = source.objectType;
      source.objectType = replaced > 0 ? replaced : -1;
    }
    return true;
  };
  Hive.inventory.swapSlots = (from, to) => {
    calls.slotSwaps.push([from, to]);
    [inventory[from], inventory[to]] = [inventory[to], inventory[from]];
  };
  Hive.loot.getItemInfo = (objectType) => itemInfo.get(objectType) ?? null;
  Hive.walking.stopMoving = () => {};
  Hive.walking.nexus = () => { calls.nexus++; };
  Hive.walking.enterVault = () => { calls.enterVault++; };
  Hive.walking.pathfindingWalkTo = (x, y) => {
    calls.walks.push({ x, y });
    return true;
  };

  return {
    state,
    equip,
    activity,
    inventory,
    storage,
    calls,
    setMap(name) { currentMap = name; },
  };
}

test('does nothing when disabled or when vault has no upgrades', () => {
  const ctx = setup({
    vaultSlots: [{ objectId: 300, slotId: 0, objectType: 101 }],
    compatible: [101],
  });
  assert.equal(ctx.equip.onLoop(), null);
  assert.equal(ctx.state.equipVaultUpgradesActive, false);

  ctx.state.equipVaultUpgradesEnabled = false;
  ctx.storage.vault[0].objectType = 102;
  assert.equal(ctx.equip.onLoop(), null);
});

test('from another map, enterVault keeps upgrade intent sticky', () => {
  const ctx = setup({ mapName: 'Realm of the Mad God' });
  assert.equal(ctx.equip.onLoop(), 200);
  assert.equal(ctx.state.equipVaultUpgradesActive, true);
  assert.equal(ctx.calls.enterVault, 1);
  assert.equal(ctx.calls.nexus, 0);
});

test('in Nexus, enterVault is owned by the upgrade controller', () => {
  const ctx = setup({ mapName: 'Nexus' });
  assert.equal(ctx.equip.onLoop(), 200);
  assert.equal(ctx.state.equipVaultUpgradesActive, true);
  assert.equal(ctx.calls.enterVault, 1);
});

test('in Vault, withdraws and equips an ordinary upgrade via AutoLoot rules', () => {
  const ctx = setup();
  assert.equal(ctx.equip.onLoop(), 200);
  assert.equal(ctx.state.equipVaultUpgradesActive, true);
  assert.equal(ctx.calls.swaps.length, 1);
  assert.equal(ctx.inventory[0], 102);

  assert.equal(ctx.equip.onLoop(), null);
  assert.equal(ctx.state.equipVaultUpgradesActive, false);
  assert.match(ctx.activity.join('\n'), /equipped T2 Staff/i);
});

test('preserves enchanted gear by buffering before equip', () => {
  const ctx = setup({
    enchantments: { 0: { typeIds: [1, 2, 3] } },
  });
  assert.equal(ctx.equip.onLoop(), 200);
  assert.equal(ctx.inventory[4], 102);
  assert.equal(ctx.inventory[0], 101);

  assert.equal(ctx.equip.onLoop(), 200);
  assert.deepEqual(ctx.calls.slotSwaps, [[4, 0]]);
  assert.equal(ctx.inventory[0], 102);
  assert.equal(ctx.inventory[4], 101);

  assert.equal(ctx.equip.onLoop(), null);
  assert.match(ctx.activity.join('\n'), /kept T1 Staff/i);
});

test('chooses the best upgrade for a slot and ignores non-upgrades', () => {
  const ctx = setup({
    metadata: [
      gear(101, 'T1 Staff', 1),
      gear(102, 'T2 Staff', 2),
      gear(103, 'T3 Staff', 3),
      gear(201, 'T12 Dagger', 12, 'weapon'),
    ],
    vaultSlots: [
      { objectId: 300, slotId: 0, objectType: 102 },
      { objectId: 300, slotId: 1, objectType: 103 },
    ],
    compatible: [102, 103],
  });
  const eligible = ctx.equip.findEligibleUpgrades();
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].objectType, 103);
});

test('stops cleanly when inventory is full and a buffer is required', () => {
  const ctx = setup({
    enchantments: { 0: { typeIds: [1, 2, 3] } },
    inventoryFill: new Array(8).fill(999),
  });
  assert.equal(ctx.equip.onLoop(), null);
  assert.equal(ctx.state.equipVaultUpgradesActive, false);
  assert.equal(ctx.calls.swaps.length, 0);
});

test('vault upgrade buffer selection respects backpack extender capacity', () => {
  const inventoryFill = [];
  for (let slot = 4; slot <= 19; slot++) inventoryFill[slot - 4] = 1000 + slot;

  const blocked = setup({
    enchantments: { 0: { typeIds: [1, 2, 3] } },
    inventoryFill,
    backpackTier: 2,
  });
  assert.equal(blocked.equip.onLoop(), null);
  assert.equal(blocked.calls.swaps.length, 0);

  const withExtender = setup({
    enchantments: { 0: { typeIds: [1, 2, 3] } },
    inventoryFill,
    backpackTier: 3,
  });
  assert.equal(withExtender.equip.onLoop(), 200);
  assert.equal(withExtender.inventory[20], 102);
  assert.equal(withExtender.inventory[0], 101);
});
