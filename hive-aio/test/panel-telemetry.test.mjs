import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import HiveAIO from '../src/HiveAIO.mjs';

test('Hive AIO panel shows and clears the persistent enemy target', () => {
  const controller = new HiveAIO();
  const props = new Map();
  controller.state.panel = {
    setProps: (id, value) => props.set(id, value),
    setValue() {},
    setText() {},
  };
  controller.state.automationRunning = true;
  controller.state.mapKind = 'realm';
  controller.state.currentTargetObjectId = 44;

  Hive.self.getHP = () => 800;
  Hive.self.getMaxHP = () => 800;
  Hive.self.getLevel = () => 20;
  Hive.self.distanceTo = () => 5;
  Hive.world.getName = () => 'Realm of the Mad God';
  Hive.ui.status = () => {};
  Hive.enemies.getById = (objectId) => objectId === 44
    ? {
        objectId,
        objectType: 29221,
        name: 'Abyssal Kraken',
        position: { x: 4, y: 3 },
        hp: 6000,
        maxHp: 6000,
        isBoss: true,
      }
    : null;

  controller.refreshPanel();
  assert.deepEqual(props.get('current-target'), {
    value: 'Abyssal Kraken',
    detail: 'Object 44 | 5.0 tiles | 6000 / 6000 HP',
    tone: 'danger',
  });

  Hive.enemies.getById = () => null;
  controller.refreshPanel();
  assert.deepEqual(props.get('current-target'), {
    value: 'None',
    detail: 'No active enemy',
    tone: 'neutral',
  });
  assert.equal(controller.state.currentTargetObjectId, null);
});

test('Hive AIO panel reads the live selector target when callback state is stale', () => {
  const controller = new HiveAIO();
  const props = new Map();
  controller.state.panel = {
    setProps: (id, value) => props.set(id, value),
    setValue() {},
    setText() {},
  };
  controller.state.currentTargetObjectId = null;
  controller.tree = { getCurrentTargetObjectId: () => 55 };

  Hive.self.getHP = () => 150;
  Hive.self.getMaxHP = () => 150;
  Hive.self.getLevel = () => 3;
  Hive.self.distanceTo = () => 7.25;
  Hive.world.getName = () => 'Realm of the Mad God';
  Hive.ui.status = () => {};
  Hive.enemies.getById = (objectId) => objectId === 55
    ? {
        objectId,
        objectType: 21770,
        name: 'Pirate',
        position: { x: 7, y: 1 },
        hp: 5,
        maxHp: 5,
        isBoss: false,
      }
    : null;

  controller.refreshPanel();

  assert.equal(controller.state.currentTargetObjectId, 55);
  assert.deepEqual(props.get('current-target'), {
    value: 'Pirate',
    detail: 'Object 55 | 7.3 tiles | 5 / 5 HP',
    tone: 'warning',
  });
});

test('Hive AIO autododge toggle controls predictive dodge without cancelling movement', () => {
  const controller = new HiveAIO();
  const calls = [];
  controller.state.automationRunning = true;
  controller.state.panel = { appendLog() {} };
  Hive.walking.enableAutoDodge = (options) => calls.push(['enable', options]);
  Hive.walking.disableAutoDodge = () => calls.push(['disable']);
  Hive.walking.stopMoving = () => calls.push(['stop']);

  controller.setAutoDodgeEnabled(true);
  controller.setAutoDodgeEnabled(false);

  assert.deepEqual(calls, [
    ['enable', { safeWalk: true, projectileJump: true, maxJumpDistance: 1.5 }],
    ['disable'],
  ]);
});
