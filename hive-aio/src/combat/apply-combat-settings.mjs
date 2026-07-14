import { Hive } from '@hive/sdk';
import { isRealmMap } from '../world/map-kind.mjs';

export function disableCombatAutomation() {
  Hive.combat.disableAutoAim();
  Hive.combat.disableAutoAbility();
  Hive.combat.disableProjectileNoclip();
  Hive.walking.disableAutoDodge();
}

function applyProjectileNoclip(state) {
  if (state.projectileNoclipEnabled) {
    Hive.combat.enableProjectileNoclip();
  } else {
    Hive.combat.disableProjectileNoclip();
  }
}

export function applyCombatSettings(state) {
  if (!state.automationRunning) {
    disableCombatAutomation();
    return;
  }

  if (!isRealmMap()) {
    Hive.combat.disableAutoAim();
    Hive.combat.disableAutoAbility();
    Hive.walking.disableAutoDodge();
    applyProjectileNoclip(state);
    return;
  }

  if (state.autoAimEnabled) {
    Hive.combat.enableAutoAim({
      mode: 'closest',
      bossPriority: false,
    });
  } else {
    Hive.combat.disableAutoAim();
  }

  if (state.autoAbilityEnabled) {
    Hive.combat.enableAutoAbility();
  } else {
    Hive.combat.disableAutoAbility();
  }

  if (state.autoDodgeEnabled) {
    Hive.walking.enableAutoDodge({ safeWalk: true });
  } else {
    Hive.walking.disableAutoDodge();
  }

  applyProjectileNoclip(state);
}
