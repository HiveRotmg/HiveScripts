import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { ScriptState } from '../src/state/ScriptState.mjs';
import { VaultManager } from '../src/storage/VaultManager.mjs';
import { resetAllVaultNavigation } from '../src/storage/navigate-to-vault.mjs';
import { mockInventoryCapacity } from './helpers/mock-inventory-capacity.mjs';

const ATTACK_POTION = 2591;
const ORDINARY_ITEM = 5000;

function setup({
  inventory = new Array(28).fill(-1),
  potionSlots,
  vaultSlots,
  vaultPopulated = false,
  backpackTier = 1,
} = {}) {
  resetAllVaultNavigation();
  const state = new ScriptState();
  state.automationRunning = true;
  const activity = [];
  const controller = {
    state,
    appendActivity(message) { activity.push(message); },
  };
  const manager = new VaultManager(controller);
  const calls = { enterVault: 0, nexus: 0, swaps: [], stops: 0 };
  let mapName = 'Nexus';
  let hasVaultSnapshot = vaultPopulated;
  const storage = {
    potionVault: potionSlots ?? [
      { objectId: 200, slotId: 0, objectType: -1 },
      { objectId: 200, slotId: 1, objectType: -1 },
    ],
    vault: vaultSlots ?? [
      { objectId: 300, slotId: 0, objectType: -1 },
      { objectId: 300, slotId: 1, objectType: -1 },
    ],
  };

  Hive.world.getName = () => mapName;
  Hive.world.isNexus = () => mapName === 'Nexus';
  Hive.inventory.getAll = () => [...inventory];
  mockInventoryCapacity(Hive, backpackTier);
  Hive.inventory.getContainerSlots = (container) => storage[container] ?? [];
  Hive.inventory.getVaultSnapshot = () => {
    if (mapName === 'Vault') hasVaultSnapshot = true;
    if (!hasVaultSnapshot) throw new Error('Vault has not been entered');
    return {
      active: mapName === 'Vault',
      complete: true,
    };
  };
  Hive.inventory.swapContainers = (from, to) => {
    calls.swaps.push({ from, to });
    return true;
  };
  Hive.loot.getItemInfo = (objectType) => objectType === ATTACK_POTION
    ? { name: 'Potion of Attack' }
    : { name: `Item ${objectType}` };
  Hive.walking.stopMoving = () => { calls.stops++; };
  Hive.walking.enterVault = () => { calls.enterVault++; };
  Hive.walking.nexus = () => { calls.nexus++; };

  return {
    state,
    manager,
    activity,
    inventory,
    storage,
    calls,
    setMap(name) { mapName = name; },
  };
}

test('startup visits Vault, waits five seconds for data, and returns to Nexus before completing', () => {
  const ctx = setup();
  const originalNow = Date.now;
  let now = 10_000;
  Date.now = () => now;

  try {
    ctx.setMap('Realm of the Mad God');
    assert.equal(ctx.manager.onLoop(), 200);
    assert.equal(ctx.calls.enterVault, 1);
    assert.equal(ctx.calls.nexus, 0);

    now += 3000;
    ctx.setMap('Nexus');
    ctx.manager.onLoop();
    assert.equal(ctx.calls.enterVault, 2);

    ctx.setMap('Vault');
    ctx.manager.onLoop();
    now += 4999;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.nexus, 0);

    now += 1;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.nexus, 1);
    assert.equal(ctx.state.vaultOnStartDone, false);

    ctx.setMap('Nexus');
    ctx.manager.onLoop();
    assert.equal(ctx.state.vaultOnStartDone, true);
    assert.match(ctx.activity.at(-1), /initialization complete/i);
  } finally {
    Date.now = originalNow;
  }
});

test('startup uses a complete cached Vault snapshot without entering the Vault', () => {
  const ctx = setup({ vaultPopulated: true });

  ctx.manager.onAutomationStart();

  assert.equal(ctx.state.vaultOnStartDone, true);
  assert.equal(ctx.calls.enterVault, 0);
  assert.match(ctx.activity.at(-1), /cached Vault storage data/i);
});

test('a Nexus stat potion enters Vault and deposits into potion storage even when inventory is not full', () => {
  const originalNow = Date.now;
  let now = 10_000;
  Date.now = () => now;
  const inventory = new Array(28).fill(-1);
  inventory[4] = ATTACK_POTION;
  const ctx = setup({ inventory });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();

  try {
    ctx.manager.onLoop();
    assert.equal(ctx.calls.enterVault, 1);

    ctx.setMap('Vault');
    ctx.manager.onLoop();
    assert.deepEqual(ctx.calls.swaps, [{
      from: { container: 'inventory', slotId: 4 },
      to: { container: 'potionVault', slotId: 0 },
    }]);

    inventory[4] = -1;
    ctx.storage.potionVault[0].objectType = ATTACK_POTION;
    ctx.manager.onLoop();
    now += 750;
    ctx.manager.onLoop();
    now += 2000;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.nexus, 1);
    assert.match(ctx.activity.find((line) => line.includes('Deposited')) ?? '', /potion storage/);
  } finally {
    Date.now = originalNow;
  }
});

test('multiple potion deposits do not reuse a destination while its snapshot is stale', () => {
  const originalNow = Date.now;
  let now = 15_000;
  Date.now = () => now;
  const inventory = new Array(28).fill(-1);
  inventory[4] = ATTACK_POTION;
  inventory[5] = ATTACK_POTION;
  const ctx = setup({ inventory });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();

  try {
    ctx.manager.onLoop();
    ctx.setMap('Vault');
    ctx.manager.onLoop();
    assert.equal(ctx.calls.swaps.length, 1);
    assert.equal(ctx.calls.swaps[0].to.slotId, 0);

    // Player inventory clears first; potion storage is still one update behind.
    inventory[4] = -1;
    ctx.manager.onLoop();
    now += 749;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.swaps.length, 1);

    now += 1;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.swaps.length, 2);
    assert.deepEqual(ctx.calls.swaps[1], {
      from: { container: 'inventory', slotId: 5 },
      to: { container: 'potionVault', slotId: 1 },
    });
  } finally {
    Date.now = originalNow;
  }
});

test('a full inventory of attack potions deposits to distinct slots in one Vault visit', () => {
  const originalNow = Date.now;
  let now = 17_500;
  Date.now = () => now;
  const inventory = new Array(28).fill(-1);
  for (let slot = 4; slot <= 11; slot++) inventory[slot] = ATTACK_POTION;
  const potionSlots = Array.from({ length: 8 }, (_, slotId) => ({
    objectId: 200,
    slotId,
    objectType: -1,
  }));
  const ctx = setup({ inventory, potionSlots });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();

  try {
    ctx.manager.onLoop();
    ctx.setMap('Vault');
    ctx.manager.onLoop();

    for (let slot = 4; slot <= 11; slot++) {
      assert.equal(ctx.calls.swaps.at(-1).from.slotId, slot);
      inventory[slot] = -1;
      ctx.manager.onLoop();
      if (slot < 11) {
        now += 750;
        ctx.manager.onLoop();
      }
    }

    assert.deepEqual(
      ctx.calls.swaps.map(({ to }) => to.slotId),
      [0, 1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(ctx.calls.nexus, 0);
  } finally {
    Date.now = originalNow;
  }
});

test('the script remains in Vault while a requested potion is still carried', () => {
  const originalNow = Date.now;
  let now = 19_000;
  Date.now = () => now;
  const inventory = new Array(28).fill(-1);
  inventory[4] = ATTACK_POTION;
  inventory[5] = ATTACK_POTION;
  inventory[6] = ATTACK_POTION;
  const ctx = setup({ inventory });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();

  try {
    ctx.manager.onLoop();
    ctx.setMap('Vault');
    ctx.manager.onLoop();

    inventory[4] = -1;
    ctx.manager.onLoop();
    now += 750;
    ctx.manager.onLoop();
    inventory[5] = -1;
    ctx.manager.onLoop();
    now += 5000;
    ctx.manager.onLoop();

    assert.equal(ctx.calls.swaps.length, 2);
    assert.equal(ctx.calls.nexus, 0);
    assert.equal(ctx.state.storageBlocked, true);

    ctx.storage.potionVault[0].objectType = ATTACK_POTION;
    ctx.storage.potionVault[1].objectType = ATTACK_POTION;
    ctx.storage.potionVault.push({ objectId: 200, slotId: 2, objectType: -1 });
    ctx.manager.onLoop();

    assert.equal(ctx.calls.swaps.length, 3);
    assert.equal(ctx.calls.swaps.at(-1).from.slotId, 6);
    assert.equal(ctx.calls.swaps.at(-1).to.slotId, 2);
    assert.equal(ctx.state.storageBlocked, false);
  } finally {
    Date.now = originalNow;
  }
});

test('a full Realm inventory enters Vault via shared enterVault, deposits potions first, then non-potions', () => {
  const originalNow = Date.now;
  let now = 20_000;
  Date.now = () => now;
  const inventory = new Array(28).fill(-1);
  for (let slot = 4; slot <= 11; slot++) inventory[slot] = ORDINARY_ITEM + slot;
  inventory[4] = ATTACK_POTION;
  const ctx = setup({ inventory });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();
  ctx.setMap('Realm of the Mad God');

  try {
    ctx.manager.onLoop();
    assert.equal(ctx.calls.enterVault, 1);
    assert.equal(ctx.calls.nexus, 0);
    assert.equal(ctx.state.storageDepositNonPotions, true);

    now += 3000;
    ctx.setMap('Nexus');
    ctx.manager.onLoop();
    assert.equal(ctx.calls.enterVault, 2);

    ctx.setMap('Vault');
    ctx.manager.onLoop();
    assert.equal(ctx.calls.swaps[0].to.container, 'potionVault');

    inventory[4] = -1;
    ctx.storage.potionVault[0].objectType = ATTACK_POTION;
    ctx.manager.onLoop();
    now += 750;
    ctx.manager.onLoop();
    assert.equal(ctx.calls.swaps[1].to.container, 'vault');
    assert.equal(ctx.calls.swaps[1].from.slotId, 5);
  } finally {
    Date.now = originalNow;
  }
});

test('a full inventory with no matching storage space remains blocked in Nexus', () => {
  const inventory = new Array(28).fill(-1);
  for (let slot = 4; slot <= 11; slot++) inventory[slot] = ATTACK_POTION;
  const fullPotionStorage = [{ objectId: -1, slotId: 0, objectType: ATTACK_POTION }];
  const fullVault = [{ objectId: -1, slotId: 0, objectType: ORDINARY_ITEM }];
  const ctx = setup({ inventory, potionSlots: fullPotionStorage, vaultSlots: fullVault });
  ctx.state.vaultOnStartDone = true;
  ctx.manager.onAutomationStart();

  assert.equal(ctx.manager.onLoop(), 200);
  assert.equal(ctx.calls.enterVault, 0);
  assert.equal(ctx.state.storageBlocked, true);
  assert.match(ctx.activity.at(-1), /no matching storage space/i);
});

test('VaultManager deposit scans all and only usable inventory slots', () => {
  const inventory = new Array(28).fill(-1);
  inventory[0] = 999;
  inventory[4] = ATTACK_POTION;
  inventory[12] = ORDINARY_ITEM;
  inventory[20] = ORDINARY_ITEM + 1;

  const baseOnly = setup({ inventory: [...inventory], backpackTier: 1 });
  assert.deepEqual(
    baseOnly.manager.carriedSlots(inventory).filter(({ objectType }) => objectType >= 0).map(({ slotIndex }) => slotIndex),
    [4],
  );

  const withBackpack = setup({ inventory: [...inventory], backpackTier: 2 });
  assert.deepEqual(
    withBackpack.manager.carriedSlots(inventory).filter(({ objectType }) => objectType >= 0).map(({ slotIndex }) => slotIndex),
    [4, 12],
  );

  const withExtender = setup({ inventory: [...inventory], backpackTier: 3 });
  assert.deepEqual(
    withExtender.manager.carriedSlots(inventory).filter(({ objectType }) => objectType >= 0).map(({ slotIndex }) => slotIndex),
    [4, 12, 20],
  );
});
