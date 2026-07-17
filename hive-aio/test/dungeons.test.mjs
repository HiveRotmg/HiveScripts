import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive, TreeScript } from '@hive/sdk';
import { createTree } from '../src/tree/create-tree.mjs';
import {
  dungeonDefinitions,
  resolveCurrentDungeonId,
} from '../src/tree/dungeons/index.mjs';
import { getMapKind } from '../src/world/map-kind.mjs';

function createController() {
  return {
    state: {
      automationRunning: true,
      vault: false,
      autoDodgeEnabled: false,
      wantedDungeon: null,
      currentDungeon: null,
    },
    appendActivity() {},
  };
}

function activeNames(tree) {
  return tree.getActivePath().map((node) => node.getName());
}

test('dungeon registry exposes consistent solver definitions', () => {
  assert.ok(dungeonDefinitions.length >= 80);
  for (const definition of dungeonDefinitions) {
    assert.equal(typeof definition.id, 'string');
    assert.equal(typeof definition.name, 'string');
    assert.equal(typeof definition.isMap, 'function');
    assert.equal(typeof definition.createBranch, 'function');
    assert.ok(Array.isArray(definition.portalTypes));
    assert.ok(Array.isArray(definition.bossTypes));
  }
});

test('DungeonRouterBranch activates Exalted Kitchen by map detection only', () => {
  const controller = createController();
  controller.state.wantedDungeon = null;
  const { tree } = (() => {
    const tree = new TreeScript();
    const nodes = createTree(controller);
    tree.addBranches(...nodes.branches);
    return { tree, nodes };
  })();

  Hive.world.isNexus = () => false;
  Hive.world.getName = () => 'Exalted Kitchen';

  assert.equal(getMapKind(), 'dungeon');
  assert.equal(resolveCurrentDungeonId(), 'exalted-kitchen');
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Dungeons',
    'Exalted Kitchen',
    'Await Exalted Kitchen Logic',
  ]);
});

test('dungeon solvers ignore wantedDungeon intent for activation', () => {
  const controller = createController();
  controller.state.wantedDungeon = 'snake-pit';
  const tree = new TreeScript();
  tree.addBranches(...createTree(controller).branches);

  Hive.world.isNexus = () => false;
  Hive.world.getName = () => 'Exalted Kitchen';

  assert.equal(resolveCurrentDungeonId(), 'exalted-kitchen');
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Dungeons',
    'Exalted Kitchen',
    'Await Exalted Kitchen Logic',
  ]);
});

test('Snake Pit map selects the Snake Pit solver', () => {
  const controller = createController();
  const tree = new TreeScript();
  tree.addBranches(...createTree(controller).branches);

  Hive.world.isNexus = () => false;
  Hive.world.getName = () => 'Snake Pit';

  assert.equal(resolveCurrentDungeonId(), 'snake-pit');
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Dungeons',
    'Snake Pit',
    'Await Snake Pit Logic',
  ]);
});

test('Dungeons branch is valid for every registered dungeon map name', () => {
  const controller = createController();
  const tree = new TreeScript();
  const nodes = createTree(controller);
  tree.addBranches(...nodes.branches);
  const dungeonsBranch = nodes.branches.find((branch) => branch.getName() === 'Dungeons');

  Hive.world.isNexus = () => false;

  for (const definition of dungeonDefinitions) {
    Hive.world.getName = () => definition.name;
    assert.equal(definition.isMap(), true, `${definition.id} isMap`);
    assert.equal(getMapKind(), 'dungeon', `${definition.id} map kind`);
    assert.equal(dungeonsBranch.isValid(), true, `${definition.id} router valid`);
    assert.equal(activeNames(tree)[1], 'Dungeons', `${definition.id} active branch`);
  }
});
