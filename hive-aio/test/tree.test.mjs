import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive, TreeScript } from '@hive/sdk';
import { NEXUS_HEALING_WAYPOINT, NEXUS_PORTAL_WAYPOINT } from '../src/config/constants.mjs';
import { createTree } from '../src/tree/create-tree.mjs';

function createController() {
  return {
    state: {
      automationRunning: true,
      vault: false,
    },
  };
}

function createTestTree(controller) {
  const tree = new TreeScript();
  const nodes = createTree(controller);
  tree.addBranches(...nodes.branches);
  return { tree, nodes };
}

function activeNames(tree) {
  return tree.getActivePath().map((node) => node.getName());
}

function setWorld({
  mapName,
  hp = 100,
  maxHp = 100,
  level = 1,
  reached = false,
  position = { x: 0, y: 0 },
  beacons = [],
}) {
  Hive.world.isNexus = () => mapName === 'Nexus';
  Hive.world.getName = () => mapName;
  Hive.self.getHP = () => hp;
  Hive.self.getMaxHP = () => maxHp;
  Hive.self.getLevel = () => level;
  Hive.self.getPosition = () => position;
  Hive.self.distanceTo = (target) => Math.hypot(target.x - position.x, target.y - position.y);
  Hive.world.objects.getBeacons = () => beacons;
  Hive.walking.hasReached = () => reached;
}

test('tree selects every requested Nexus and Realm path', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);

  setWorld({ mapName: 'Nexus', hp: 100, maxHp: 100, reached: false });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Nexus',
    'Nexus Full Health',
    'Realm Entry',
    'Walk To Nexus Portal Waypoint',
  ]);

  controller.state.vault = true;
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Nexus',
    'Nexus Full Health',
    'Vault Enabled Placeholder',
  ]);

  controller.state.vault = false;
  setWorld({ mapName: 'Nexus', hp: 99, maxHp: 100 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Nexus',
    'Nexus Not Full Health',
    'Walk To Nexus Healers',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 7 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Level Below 8',
    'Walk To Nearest Enemy',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 8 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Levels 8 Through 13',
    'Walk To Nearest Enemy',
  ]);

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 13,
    beacons: [{
      objectId: 40,
      objectType: 52974,
      name: 'Teleport Beacon Forest',
      position: { x: 150, y: 0 },
    }],
  });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Levels 8 Through 13',
    'Teleport To Random Beacon',
  ]);

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 14,
    beacons: [{
      objectId: 50,
      objectType: 0xCEFA,
      name: 'Deep Sea Abyss Beacon (Veteran)',
      position: { x: 250, y: 0 },
    }],
  });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Levels 14 Through 20',
    'Walk To Nearest Enemy Near Deep Sea Abyss Beacon',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 20 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Levels 14 Through 20',
    'Teleport To Deep Sea Abyss Beacon',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 21 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Level Above 20',
    'Level Above 20 Placeholder',
  ]);
});

test('Realm entry walks to the existing waypoint and ignores full portals', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];
  const entered = [];

  setWorld({ mapName: 'Nexus', reached: false });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  activeNames(tree);
  tree.onLoop();
  assert.deepEqual(movement, [NEXUS_PORTAL_WAYPOINT]);

  Hive.walking.hasReached = () => true;
  Hive.self.getPosition = () => ({ x: 12, y: 14 });
  Hive.world.getRealmPortals = () => [
    { objectId: 10, name: 'Full', players: 85, maxPlayers: 85, x: 12, y: 14 },
    { objectId: 20, name: 'Open', players: 40, maxPlayers: 85, x: 12, y: 14 },
  ];
  Hive.walking.enterPortal = (objectId) => {
    entered.push(objectId);
    return true;
  };

  assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
  tree.onLoop();
  assert.deepEqual(entered, [20]);
});

test('injured Nexus routing walks to the healers until HP is full', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];

  setWorld({ mapName: 'Nexus', hp: 80, maxHp: 100, reached: false });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  assert.equal(activeNames(tree).at(-1), 'Walk To Nexus Healers');
  tree.onLoop();
  assert.deepEqual(movement, [NEXUS_HEALING_WAYPOINT]);

  Hive.walking.hasReached = () => true;
  tree.onLoop();
  assert.deepEqual(movement, [NEXUS_HEALING_WAYPOINT]);

  Hive.self.getHP = () => 100;
  Hive.walking.hasReached = () => false;
  assert.equal(activeNames(tree).at(-1), 'Walk To Nexus Portal Waypoint');
});

test('low-level Realm leaf walks toward the nearest enemy', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];

  setWorld({ mapName: 'Realm of the Mad God', level: 3 });
  Hive.enemies.getNearest = () => ({
    objectId: 30,
    name: 'Enemy',
    position: { x: 21, y: 34 },
  });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  tree.onLoop();
  assert.deepEqual(movement, [{ x: 21, y: 34 }]);
});

test('Realm targeting persists across level routes until another enemy is more than 10 tiles closer', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];
  const enemies = new Map();
  let nearestId = 30;

  const current = {
    objectId: 30,
    name: 'Current Enemy',
    position: { x: 30, y: 0 },
  };
  const candidate = {
    objectId: 40,
    name: 'Candidate Enemy',
    position: { x: 20, y: 0 },
  };
  enemies.set(current.objectId, current);
  enemies.set(candidate.objectId, candidate);

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 3,
    beacons: [{
      objectId: 50,
      objectType: 52974,
      name: 'Teleport Beacon Forest',
      position: { x: 0, y: 0 },
    }],
  });
  Hive.enemies.getNearest = () => enemies.get(nearestId) ?? null;
  Hive.enemies.getById = (objectId) => enemies.get(objectId) ?? null;
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  tree.onLoop();
  Hive.self.getLevel = () => 10;
  nearestId = candidate.objectId;
  tree.onLoop();
  tree.onLoop();

  current.position.x = 31;
  tree.onLoop();

  assert.deepEqual(movement, [
    { x: 30, y: 0 },
    { x: 30, y: 0 },
    { x: 20, y: 0 },
  ]);
});

test('Realm targeting replaces a persisted enemy that is no longer visible', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];
  const enemies = new Map();
  let nearestId = 30;

  enemies.set(30, { objectId: 30, name: 'Current Enemy', position: { x: 25, y: 0 } });
  enemies.set(40, { objectId: 40, name: 'Replacement Enemy', position: { x: 22, y: 0 } });

  setWorld({ mapName: 'Realm of the Mad God', level: 3 });
  Hive.enemies.getNearest = () => enemies.get(nearestId) ?? null;
  Hive.enemies.getById = (objectId) => enemies.get(objectId) ?? null;
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  tree.onLoop();
  enemies.delete(30);
  nearestId = 40;
  tree.onLoop();

  assert.deepEqual(movement, [
    { x: 25, y: 0 },
    { x: 22, y: 0 },
  ]);
});

test('levels 8 through 13 keep the selected low-level beacon within 150 tiles', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const position = { x: 0, y: 0 };
  const beacon = {
    objectId: 40,
    objectType: 52974,
    name: 'Teleport Beacon Forest',
    position: { x: 151, y: 0 },
  };
  const movement = [];
  const teleports = [];
  let stops = 0;

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 10,
    position,
    beacons: [beacon],
  });
  Hive.enemies.getNearest = () => ({
    objectId: 30,
    name: 'Enemy',
    position: { x: 20, y: 25 },
  });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };
  Hive.walking.canTeleport = () => true;
  Hive.walking.stopMoving = () => {
    stops += 1;
  };
  Hive.walking.teleportToBeacon = (objectId) => {
    teleports.push(objectId);
    return true;
  };

  assert.equal(activeNames(tree).at(-1), 'Teleport To Random Beacon');
  tree.onLoop();
  assert.deepEqual(teleports, [40]);
  assert.equal(stops, 1);

  position.x = 151;
  assert.equal(activeNames(tree).at(-1), 'Walk To Enemy Near Beacon');
  tree.onLoop();
  assert.deepEqual(movement, [{ x: 20, y: 25 }]);

  position.x = -1;
  assert.equal(activeNames(tree).at(-1), 'Teleport To Random Beacon');
  tree.onLoop();
  assert.deepEqual(teleports, [40, 40]);
  assert.equal(stops, 2);
});

test('levels 8 through 13 choose uniformly by region and reroll after leaving the radius', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const position = { x: 0, y: 0 };
  const teleports = [];
  const originalRandom = Math.random;

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 10,
    position,
    beacons: [
      { objectId: 10, objectType: 52974, name: 'Teleport Beacon Forest', position: { x: 180, y: 0 } },
      { objectId: 11, objectType: 52974, name: 'Teleport Beacon Forest', position: { x: 190, y: 0 } },
      { objectId: 20, objectType: 52975, name: 'Teleport Beacon Undead Forest', position: { x: 200, y: 0 } },
      { objectId: 30, objectType: 52976, name: 'Teleport Beacon Desert', position: { x: 210, y: 0 } },
    ],
  });
  Hive.walking.canTeleport = () => true;
  Hive.walking.stopMoving = () => {};
  Hive.walking.teleportToBeacon = (objectId) => {
    teleports.push(objectId);
    return true;
  };

  try {
    Math.random = () => 0.99;
    tree.onLoop();
    assert.deepEqual(teleports, [30]);

    position.x = 210;
    assert.equal(activeNames(tree).at(-1), 'Walk To Enemy Near Beacon');

    position.x = 0;
    Math.random = () => 0;
    assert.equal(activeNames(tree).at(-1), 'Teleport To Random Beacon');
    tree.onLoop();
    assert.deepEqual(teleports, [30, 10]);
  } finally {
    Math.random = originalRandom;
  }
});

test('levels 14 through 20 fight within 250 tiles and teleport back outside it', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const position = { x: 0, y: 0 };
  const beacons = [{
    objectId: 50,
    objectType: 0xCEFA,
    name: 'Deep Sea Abyss Beacon (Veteran)',
    position: { x: 250, y: 0 },
  }];
  const movement = [];
  const teleports = [];
  let stops = 0;

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 18,
    position,
    beacons,
  });
  Hive.enemies.getNearest = () => ({
    objectId: 30,
    name: 'Enemy',
    position: { x: 30, y: 35 },
  });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };
  Hive.walking.canTeleport = () => true;
  Hive.walking.stopMoving = () => {
    stops += 1;
  };
  Hive.walking.teleportBeacon = (destination) => {
    teleports.push(destination);
    return true;
  };

  assert.equal(activeNames(tree).at(-1), 'Walk To Nearest Enemy Near Deep Sea Abyss Beacon');
  tree.onLoop();
  assert.deepEqual(movement, [{ x: 30, y: 35 }]);
  assert.deepEqual(teleports, []);

  position.x = -1;
  assert.equal(activeNames(tree).at(-1), 'Teleport To Deep Sea Abyss Beacon');
  tree.onLoop();
  assert.deepEqual(teleports, ['deepsea']);
  assert.equal(stops, 1);

  beacons.length = 0;
  tree.onLoop();
  assert.deepEqual(teleports, ['deepsea']);
  assert.equal(stops, 2);
});

test('levels 8 through 13 walk to enemies until an eligible beacon appears', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const beacons = [];
  const movement = [];
  const teleports = [];
  let stops = 0;

  setWorld({ mapName: 'Realm of the Mad God', level: 10, beacons });
  Hive.enemies.getNearest = () => ({
    objectId: 30,
    name: 'Enemy',
    position: { x: 12, y: 13 },
  });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };
  Hive.walking.canTeleport = () => true;
  Hive.walking.stopMoving = () => {
    stops += 1;
  };
  Hive.walking.teleportToBeacon = (objectId) => {
    teleports.push(objectId);
    return true;
  };

  assert.equal(activeNames(tree).at(-1), 'Walk To Nearest Enemy');
  tree.onLoop();
  assert.deepEqual(movement, [{ x: 12, y: 13 }]);
  assert.deepEqual(teleports, []);
  assert.equal(stops, 0);

  beacons.push({
    objectId: 40,
    objectType: 52974,
    name: 'Teleport Beacon Forest',
    position: { x: 180, y: 0 },
  });
  assert.equal(activeNames(tree).at(-1), 'Teleport To Random Beacon');
  tree.onLoop();
  assert.deepEqual(teleports, [40]);
  assert.equal(stops, 1);
});

test('placeholder leaves issue no movement or portal commands', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  let commandCount = 0;

  Hive.walking.pathfindingWalkTo = () => {
    commandCount += 1;
    return true;
  };
  Hive.walking.enterPortal = () => {
    commandCount += 1;
    return true;
  };
  Hive.walking.teleportBeacon = () => {
    commandCount += 1;
    return true;
  };

  controller.state.vault = true;
  setWorld({ mapName: 'Nexus', hp: 100, maxHp: 100 });
  tree.onLoop();

  setWorld({ mapName: 'Nexus', hp: 80, maxHp: 100 });
  tree.onLoop();

  setWorld({ mapName: 'Realm of the Mad God', level: 21 });
  tree.onLoop();

  assert.equal(commandCount, 0);
});
