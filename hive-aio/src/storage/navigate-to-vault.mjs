import { Hive } from '@hive/sdk';
import { callOptional, stopMoving } from '../sdk/compat.mjs';

const DEFAULT_RETRY_MS = 3000;
const DEFAULT_POLL_MS = 200;

const lastCommandAtByKey = new Map();

export function isVaultMap(mapName = Hive.world.getName?.() ?? '') {
  return String(mapName).trim().toLowerCase().includes('vault');
}

/**
 * Shared Vault entry ownership for Hive AIO.
 *
 * Relies on `Hive.walking.enterVault()` (Headless client):
 * - In Vault → no-op
 * - In Nexus → walk to vault portal and enter
 * - Elsewhere → escape to Nexus while keeping vault intent, then enter
 *
 * @returns `null` when already inside the Vault; otherwise a poll delay after
 *          issuing (or throttling) the enter-vault command.
 */
export function progressTowardVault({
  key = 'default',
  retryMs = DEFAULT_RETRY_MS,
  pollMs = DEFAULT_POLL_MS,
  message,
  appendActivity,
} = {}) {
  if (isVaultMap()) return null;

  const now = Date.now();
  const lastAt = lastCommandAtByKey.get(key) ?? 0;
  if (now - lastAt >= retryMs) {
    lastCommandAtByKey.set(key, now);
    stopMoving();
    callOptional(Hive.walking, 'enterVault');
    if (message && typeof appendActivity === 'function') appendActivity(message);
  }

  return pollMs;
}

export function resetVaultNavigation(key = 'default') {
  lastCommandAtByKey.delete(key);
}

export function resetAllVaultNavigation() {
  lastCommandAtByKey.clear();
}
