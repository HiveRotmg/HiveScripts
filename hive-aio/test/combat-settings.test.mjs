import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { applyCombatSettings } from '../src/combat/apply-combat-settings.mjs';

test('combat settings keep goal-owned autododge enabled for all automated movement', () => {
  const calls = [];
  const state = {
    automationRunning: true,
    autoAimEnabled: false,
    autoAbilityEnabled: false,
    autoDodgeEnabled: true,
    projectileNoclipEnabled: true,
  };

  Hive.world.getName = () => 'Realm of the Mad God';
  Hive.combat.disableAutoAim = () => calls.push('disableAutoAim');
  Hive.combat.disableAutoAbility = () => calls.push('disableAutoAbility');
  Hive.combat.enableProjectileNoclip = () => calls.push('enableProjectileNoclip');
  Hive.combat.disableProjectileNoclip = () => calls.push('disableProjectileNoclip');
  Hive.walking.enableAutoDodge = (options) => calls.push(['enableAutoDodge', options]);
  Hive.walking.disableAutoDodge = () => calls.push('disableAutoDodge');

  applyCombatSettings(state);
  assert.deepEqual(calls, [
    ['enableAutoDodge', { safeWalk: true, projectileJump: true, maxJumpDistance: 1.5 }],
    'disableAutoAim',
    'disableAutoAbility',
    'enableProjectileNoclip',
  ]);

  calls.length = 0;
  state.automationRunning = false;
  applyCombatSettings(state);
  assert.deepEqual(calls, [
    'disableAutoAim',
    'disableAutoAbility',
    'disableProjectileNoclip',
    'disableAutoDodge',
  ]);
});

test('goal-owned autododge and projectile noclip remain enabled outside a realm', () => {
  const calls = [];
  const state = {
    automationRunning: true,
    autoAimEnabled: true,
    autoAbilityEnabled: true,
    autoDodgeEnabled: true,
    projectileNoclipEnabled: true,
  };

  Hive.world.getName = () => 'Nexus';
  Hive.combat.disableAutoAim = () => calls.push('disableAutoAim');
  Hive.combat.disableAutoAbility = () => calls.push('disableAutoAbility');
  Hive.combat.enableProjectileNoclip = () => calls.push('enableProjectileNoclip');
  Hive.walking.enableAutoDodge = (options) => calls.push(['enableAutoDodge', options]);
  Hive.walking.disableAutoDodge = () => calls.push('disableAutoDodge');

  applyCombatSettings(state);

  assert.deepEqual(calls, [
    ['enableAutoDodge', { safeWalk: true, projectileJump: true, maxJumpDistance: 1.5 }],
    'disableAutoAim',
    'disableAutoAbility',
    'enableProjectileNoclip',
  ]);
});
