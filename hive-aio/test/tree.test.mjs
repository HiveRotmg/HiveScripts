import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive, TreeScript } from '@hive/sdk';
import { LIMITS, NEXUS_HEALING_WAYPOINT, NEXUS_PORTAL_WAYPOINT, TIMING } from '../src/config/constants.mjs';
import { EnemyNavigator, pathfindingWalkTo } from '../src/movement/pathfinding.mjs';
import { createTree } from '../src/tree/create-tree.mjs';

function createController() {
  return {
    state: {
      automationRunning: true,
      vault: false,
      autoDodgeEnabled: false,
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

const COMBAT_PATH_OPTIONS = Object.freeze({
  minimumEnemyDistance: LIMITS.enemyExclusionDistanceTiles,
  preferredRangeRatio: LIMITS.preferredCombatRangeRatio,
});
const DODGE_PATH_OPTIONS = Object.freeze({
  safeWalk: true,
  projectileJump: true,
  maxJumpDistance: 1.5,
});
const DEFAULT_BASE_STATS = Object.freeze({
  maxHP: 600,
  maxMP: 300,
  attack: 0,
  defense: 0,
  speed: 0,
  dexterity: 0,
  vitality: 0,
  wisdom: 0,
});
const DEFAULT_STAT_CAPS = Object.freeze({
  maxHP: 770,
  maxMP: 385,
  attack: 75,
  defense: 25,
  speed: 50,
  dexterity: 75,
  vitality: 40,
  wisdom: 60,
});

test('generic AIO movement uses one combined navigation call when autododge is enabled', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const calls = [];
  Hive.walking.navigateTo = (x, y, options) => {
    calls.push({ x, y, options });
    return true;
  };

  assert.equal(pathfindingWalkTo(controller, 12, 18, 0.4), true);
  assert.deepEqual(calls, [{
    x: 12,
    y: 18,
    options: { arriveThreshold: 0.4, ...DODGE_PATH_OPTIONS },
  }]);
});

function setWorld({
  mapName,
  hp = 100,
  maxHp = 100,
  level = 1,
  reached = false,
  position = { x: 0, y: 0 },
  beacons = [],
  dimensions = { width: 1024, height: 1024 },
  baseStats = DEFAULT_BASE_STATS,
  statCaps = DEFAULT_STAT_CAPS,
}) {
  Hive.world.isNexus = () => mapName === 'Nexus';
  Hive.world.getName = () => mapName;
  Hive.self.getHP = () => hp;
  Hive.self.getMaxHP = () => maxHp;
  Hive.self.getLevel = () => level;
  Hive.self.getBaseStats = () => baseStats;
  Hive.self.getStatCaps = () => statCaps;
  Hive.self.getPosition = () => position;
  Hive.self.distanceTo = (target) => Math.hypot(target.x - position.x, target.y - position.y);
  Hive.world.objects.getBeacons = () => beacons;
  Hive.world.getDimensions = () => dimensions;
  Hive.enemies.getNearest = () => null;
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
    'Levels 1 Through 8',
    'Walk To Nearest Enemy',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 8 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'Levels 1 Through 8',
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
    'Levels 9 Through 13',
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
    'High Level (14 Through 20)',
    'Walk To Nearest Enemy Near Deep Sea Abyss Beacon',
  ]);

  setWorld({ mapName: 'Realm of the Mad God', level: 20 });
  assert.deepEqual(activeNames(tree), [
    'Root',
    'Realm',
    'High Level (14 Through 20)',
    'Max Level (20)',
    'Attack-Maxing',
    'Teleport To Deep Sea Abyss Beacon',
  ]);

});

test('Max Level is available at level 20 while the Attack-Maxing testing override is enabled', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const caps = { ...DEFAULT_STAT_CAPS };
  const base = { ...caps };

  setWorld({ mapName: 'Realm of the Mad God', level: 19, baseStats: base, statCaps: caps });
  assert.equal(activeNames(tree).includes('Max Level (20)'), false);

  setWorld({ mapName: 'Realm of the Mad God', level: 20, baseStats: base, statCaps: caps });
  assert.deepEqual(activeNames(tree).slice(0, 5), [
    'Root',
    'Realm',
    'High Level (14 Through 20)',
    'Max Level (20)',
    'Attack-Maxing',
  ]);
});

test('Max Level randomizer selects only Attack-Maxing until the other tasks are implemented', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const caps = { ...DEFAULT_STAT_CAPS };
  const base = {
    ...caps,
    attack: caps.attack - 1,
    speed: caps.speed - 1,
    dexterity: caps.dexterity - 1,
  };
  const originalRandom = Math.random;

  for (const taskName of [
    'Attack-Maxing',
    'Speed-Maxing',
    'Defense-Maxing',
    'Wisdom-Maxing',
    'Vitality-Maxing',
    'Dexterity-Maxing',
  ]) {
    assert.match(tree.describe(), new RegExp(taskName));
  }

  setWorld({ mapName: 'Realm of the Mad God', level: 20, baseStats: base, statCaps: caps });
  Hive.walking.stopMoving = () => {};
  Hive.walking.canTeleport = () => false;

  try {
    Math.random = () => 0.99;
    tree.onLoop();
    assert.equal(tree.getCurrentBranchName(), 'Attack-Maxing');
    assert.equal(tree.getCurrentLeafName(), 'Teleport To Deep Sea Abyss Beacon');

    Math.random = () => 0;
    tree.onLoop();
    assert.equal(tree.getCurrentBranchName(), 'Attack-Maxing');

    base.attack = caps.attack;
    tree.onLoop();
    assert.equal(tree.getCurrentBranchName(), 'Attack-Maxing');
    assert.equal(tree.getCurrentLeafName(), 'Teleport To Deep Sea Abyss Beacon');
  } finally {
    Math.random = originalRandom;
  }
});

test("Oryx's Castle safety leaf stops movement and returns to Nexus", () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const originalNow = Date.now;
  let now = 1000;
  let stops = 0;
  let nexuses = 0;
  Date.now = () => now;

  setWorld({ mapName: 'Oryx\u2019s Castle', level: 20 });
  Hive.walking.stopMoving = () => { stops += 1; };
  Hive.walking.nexus = () => { nexuses += 1; };

  try {
    assert.deepEqual(activeNames(tree), [
      'Root',
      "Oryx's Castle",
      "Return To Nexus From Oryx's Castle",
    ]);

    tree.onLoop();
    tree.onLoop();
    assert.equal(stops, 2);
    assert.equal(nexuses, 1);

    now += 3000;
    tree.onLoop();
    assert.equal(nexuses, 2);
  } finally {
    Date.now = originalNow;
  }
});

test('Realm entry walks to the existing waypoint, ignores full portals, and settles on an open portal before entering', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];
  const entered = [];
  const originalNow = Date.now;
  let now = 1_000;
  Date.now = () => now;

  setWorld({ mapName: 'Nexus', reached: false });
  Hive.walking.pathfindingWalkTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  try {
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
    Hive.walking.stopMoving = () => {};

    assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
    tree.onLoop();
    assert.deepEqual(entered, []);

    now += TIMING.portalSettleMs - 1;
    tree.onLoop();
    assert.deepEqual(entered, []);

    now += 1;
    tree.onLoop();
    assert.deepEqual(entered, [20]);
  } finally {
    Date.now = originalNow;
  }
});

test('Realm entry does not return to the Nexus waypoint while approaching and settling on a portal', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const position = { x: 0, y: 0 };
  const movement = [];
  const entered = [];
  const originalNow = Date.now;
  let now = 2_000;
  Date.now = () => now;

  try {
    setWorld({ mapName: 'Nexus', position });
    Hive.walking.hasReached = (target, tolerance) =>
      Math.hypot(target.x - position.x, target.y - position.y) <= tolerance;
    Hive.walking.pathfindingWalkTo = (x, y) => {
      movement.push({ x, y });
      return true;
    };
    Hive.walking.stopMoving = () => {};
    Hive.walking.enterPortal = (objectId) => {
      entered.push(objectId);
      return true;
    };
    Hive.world.getRealmPortals = () => [{
      objectId: 30,
      name: 'Open',
      players: 20,
      maxPlayers: 85,
      x: 110,
      y: 140,
    }];

    tree.onLoop();
    assert.deepEqual(movement, [NEXUS_PORTAL_WAYPOINT]);

    position.x = NEXUS_PORTAL_WAYPOINT.x;
    position.y = NEXUS_PORTAL_WAYPOINT.y;
    assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
    tree.onLoop();
    assert.deepEqual(movement.at(-1), { x: 110, y: 140 });

    position.x = 110;
    position.y = 140;
    assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
    tree.onLoop();
    assert.deepEqual(entered, []);

    now += TIMING.portalSettleMs;
    assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
    tree.onLoop();
    assert.deepEqual(entered, [30]);
    assert.equal(
      movement.filter((target) => target.x === NEXUS_PORTAL_WAYPOINT.x
        && target.y === NEXUS_PORTAL_WAYPOINT.y).length,
      1,
    );
  } finally {
    Date.now = originalNow;
  }
});

test('dodge-enabled Realm entry navigates inside the portal use radius', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const { tree } = createTestTree(controller);
  const position = { ...NEXUS_PORTAL_WAYPOINT };
  const movement = [];

  setWorld({ mapName: 'Nexus', position });
  Hive.walking.hasReached = (target, tolerance) =>
    Math.hypot(target.x - position.x, target.y - position.y) <= tolerance;
  Hive.walking.navigateTo = (x, y, options) => {
    movement.push({ x, y, options });
    return true;
  };
  Hive.world.getRealmPortals = () => [{
    objectId: 40,
    name: 'Open',
    players: 20,
    maxPlayers: 85,
    x: 110,
    y: 140,
  }];

  assert.equal(activeNames(tree).at(-1), 'Enter Open Realm');
  tree.onLoop();
  assert.deepEqual(movement, [{
    x: 110,
    y: 140,
    options: {
      arriveThreshold: LIMITS.portalApproachTolerance,
      ...DODGE_PATH_OPTIONS,
    },
  }]);
  assert.ok(LIMITS.portalApproachTolerance < LIMITS.portalUseTolerance);
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y, options) => {
    movement.push({ x, y, options });
    return true;
  };

  assert.equal(tree.onLoop(), TIMING.enemyRefreshMs);
  assert.deepEqual(movement, [{ x: 21, y: 34, options: COMBAT_PATH_OPTIONS }]);
});

test('levels 1 through 8 walk toward the map center when no enemy is visible', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const movement = [];

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 8,
    dimensions: { width: 1024, height: 768 },
  });
  Hive.walking.pathfindingWalkTo = (x, y, arriveThreshold) => {
    movement.push({ x, y, arriveThreshold });
    return true;
  };

  tree.onLoop();
  assert.deepEqual(movement, [{
    x: 512,
    y: 384,
    arriveThreshold: LIMITS.realmCenterArrivalTolerance,
  }]);
});

test('levels 9 through 13 explore around the selected beacon until an enemy appears', () => {
  const controller = createController();
  const { tree } = createTestTree(controller);
  const beacon = {
    objectId: 40,
    objectType: 52974,
    name: 'Teleport Beacon Forest',
    position: { x: 200, y: 300 },
  };
  const movement = [];

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 10,
    position: { ...beacon.position },
    beacons: [beacon],
  });
  Hive.walking.pathfindingWalkTo = (x, y, arriveThreshold) => {
    movement.push({ x, y, arriveThreshold });
    return true;
  };

  tree.onLoop();
  assert.equal(activeNames(tree).at(-1), 'Walk To Enemy Near Beacon');
  tree.onLoop();
  assert.deepEqual(movement, [{
    x: beacon.position.x + LIMITS.plainsExplorationRadiusTiles,
    y: beacon.position.y,
    arriveThreshold: LIMITS.explorationArrivalTolerance,
  }]);

  Hive.enemies.getNearest = () => ({
    objectId: 50,
    name: 'Enemy',
    position: { x: 220, y: 320 },
  });
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
    movement.push({ x, y, combat: true });
    return true;
  };
  tree.onLoop();
  assert.deepEqual(movement.at(-1), { x: 220, y: 320, combat: true });
});

test('levels 14 through 20 explore around the deep-sea beacon with dodge ownership', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const { tree } = createTestTree(controller);
  const beacon = {
    objectId: 60,
    objectType: 0xCEFA,
    name: 'Deep Sea Abyss Beacon (Veteran)',
    position: { x: 400, y: 500 },
  };
  const movement = [];

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 18,
    position: { ...beacon.position },
    beacons: [beacon],
  });
  Hive.walking.navigateTo = (x, y, options) => {
    movement.push({ x, y, options });
    return true;
  };

  tree.onLoop();
  assert.deepEqual(movement, [{
    x: beacon.position.x + LIMITS.deepSeaExplorationRadiusTiles,
    y: beacon.position.y,
    options: {
      arriveThreshold: LIMITS.explorationArrivalTolerance,
      ...DODGE_PATH_OPTIONS,
    },
  }]);
});

test('distant Realm enemies use stable exploratory movement before combat-range pathfinding', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const { tree } = createTestTree(controller);
  const position = { x: 400, y: 500 };
  const enemy = {
    objectId: 70,
    name: 'Organ Harvester',
    position: { x: 553, y: 500 },
  };
  const movement = [];

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 20,
    position,
    baseStats: { ...DEFAULT_STAT_CAPS, attack: DEFAULT_STAT_CAPS.attack - 1 },
    beacons: [{
      objectId: 60,
      objectType: 0xCEFA,
      name: 'Deep Sea Abyss Beacon (Veteran)',
      position: { x: 400, y: 500 },
    }],
  });
  Hive.enemies.getNearest = () => enemy;
  Hive.enemies.getById = () => enemy;
  Hive.walking.navigateTo = (x, y, options) => {
    movement.push({ action: 'approach', x, y, options });
    return true;
  };
  Hive.walking.navigateToCombatTarget = (x, y, options) => {
    movement.push({ action: 'combat', x, y, options });
    return true;
  };
  Hive.walking.isMoving = () => true;

  tree.onLoop();
  enemy.position.x += 1;
  tree.onLoop();
  assert.deepEqual(movement, [{
    action: 'approach',
    x: 424,
    y: 500,
    options: {
      arriveThreshold: LIMITS.distantEnemyApproachToleranceTiles,
      ...DODGE_PATH_OPTIONS,
    },
  }]);

  position.x = 520;
  tree.onLoop();
  assert.deepEqual(movement.at(-1), {
    action: 'combat',
    x: 554,
    y: 500,
    options: { ...COMBAT_PATH_OPTIONS, ...DODGE_PATH_OPTIONS },
  });
});

test('distant enemy navigation replaces an accepted waypoint after no progress', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const navigator = new EnemyNavigator(controller);
  const enemy = { objectId: 70, position: { x: 553, y: 500 } };
  const movement = [];
  const originalNow = Date.now;
  let now = 1_000;

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 20,
    position: { x: 400, y: 500 },
  });
  Date.now = () => now;
  Hive.walking.isMoving = () => true;
  Hive.walking.navigateTo = (x, y) => {
    movement.push({ x, y });
    return true;
  };

  try {
    assert.equal(navigator.walk(enemy), true);
    assert.equal(navigator.walk(enemy), true);
    assert.equal(movement.length, 1);

    now += 3_000;
    assert.equal(navigator.walk(enemy), true);
    assert.equal(movement.length, 2);
    assert.notDeepEqual(movement[1], movement[0]);
    assert.ok(Math.abs(
      Math.hypot(movement[1].x - 400, movement[1].y - 500)
        - LIMITS.distantEnemyApproachStepTiles,
    ) < 1e-9);
  } finally {
    Date.now = originalNow;
  }
});

test('distant enemy navigation clears an immediately rejected waypoint', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const navigator = new EnemyNavigator(controller);
  const enemy = { objectId: 70, position: { x: 553, y: 500 } };
  const movement = [];

  setWorld({
    mapName: 'Realm of the Mad God',
    level: 20,
    position: { x: 400, y: 500 },
  });
  Hive.walking.isMoving = () => false;
  Hive.walking.navigateTo = (x, y) => {
    movement.push({ x, y });
    return movement.length > 1;
  };

  assert.equal(navigator.walk(enemy), false);
  assert.equal(navigator.walk(enemy), true);
  assert.equal(movement.length, 2);
  assert.notDeepEqual(movement[1], movement[0]);
});

test('Realm movement uses the combined goal-owned dodge navigator', () => {
  const controller = createController();
  controller.state.autoDodgeEnabled = true;
  const { tree } = createTestTree(controller);
  const movement = [];

  setWorld({ mapName: 'Realm of the Mad God', level: 3 });
  Hive.enemies.getNearest = () => ({
    objectId: 30,
    name: 'Enemy',
    position: { x: 21, y: 34 },
  });
  Hive.walking.navigateToCombatTarget = (x, y, options) => {
    movement.push({ action: 'navigateToCombatTarget', x, y, options });
    return true;
  };

  tree.onLoop();
  assert.deepEqual(movement, [
    {
      action: 'navigateToCombatTarget',
      x: 21,
      y: 34,
      options: { ...COMBAT_PATH_OPTIONS, ...DODGE_PATH_OPTIONS },
    },
  ]);
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
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
  assert.equal(controller.state.currentTargetObjectId, 40);
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
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
  assert.equal(controller.state.currentTargetObjectId, 40);
});

test('levels 9 through 13 keep the selected low-level beacon within 150 tiles', () => {
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
    movement.push({ x, y });
    return true;
  };
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
  assert.equal(movement.length, 1);
  assert.ok(Math.abs(
    Math.hypot(movement[0].x - position.x, movement[0].y - position.y)
      - LIMITS.distantEnemyApproachStepTiles,
  ) < 1e-9);
  assert.ok(
    Math.hypot(movement[0].x - 20, movement[0].y - 25)
      < Math.hypot(position.x - 20, position.y - 25),
  );

  position.x = -1;
  assert.equal(activeNames(tree).at(-1), 'Teleport To Random Beacon');
  tree.onLoop();
  assert.deepEqual(teleports, [40, 40]);
  assert.equal(stops, 2);
});

test('levels 9 through 13 choose uniformly by region and reroll after leaving the radius', () => {
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
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

test('levels 9 through 13 walk to enemies until an eligible beacon appears', () => {
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
  Hive.walking.pathfindingWalkToCombatTarget = (x, y) => {
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
  Hive.walking.pathfindingWalkToCombatTarget = () => {
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
