import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import {
  isVaultMap,
  progressTowardVault,
  resetAllVaultNavigation,
} from '../src/storage/navigate-to-vault.mjs';

test('progressTowardVault is a no-op inside the Vault', () => {
  resetAllVaultNavigation();
  Hive.world.getName = () => 'Vault';
  let enters = 0;
  Hive.walking.enterVault = () => { enters += 1; };
  Hive.walking.stopMoving = () => {};

  assert.equal(isVaultMap(), true);
  assert.equal(progressTowardVault({ key: 'test' }), null);
  assert.equal(enters, 0);
});

test('progressTowardVault calls enterVault outside the Vault and throttles retries', () => {
  resetAllVaultNavigation();
  const originalNow = Date.now;
  let now = 50_000;
  Date.now = () => now;
  Hive.world.getName = () => 'Nexus';
  let enters = 0;
  const activity = [];
  Hive.walking.enterVault = () => { enters += 1; };
  Hive.walking.stopMoving = () => {};

  try {
    assert.equal(progressTowardVault({
      key: 'test',
      message: 'go vault',
      appendActivity: (message) => activity.push(message),
    }), 200);
    assert.equal(enters, 1);
    assert.deepEqual(activity, ['go vault']);

    assert.equal(progressTowardVault({ key: 'test' }), 200);
    assert.equal(enters, 1);

    now += 3000;
    assert.equal(progressTowardVault({ key: 'test' }), 200);
    assert.equal(enters, 2);
  } finally {
    Date.now = originalNow;
    resetAllVaultNavigation();
  }
});
