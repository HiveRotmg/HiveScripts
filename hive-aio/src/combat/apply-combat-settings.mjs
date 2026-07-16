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

function applyAutoDodge(state) {
  if (state.autoDodgeEnabled) {
    Hive.walking.enableAutoDodge({
      safeWalk: true,
      projectileJump: true,
      maxJumpDistance: 1.5,
    });
  } else {
    Hive.walking.disableAutoDodge();
  }
}

export function applyCombatSettings(state) {
  if (!state.automationRunning) {
    disableCombatAutomation();
    return;
  }

  // Combined dodge owns movement toward every direct or pathfinding goal,
  // including safe movement and non-Realm navigation.
  applyAutoDodge(state);

  if (!isRealmMap()) {
    Hive.combat.disableAutoAim();
    Hive.combat.disableAutoAbility();
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

  applyProjectileNoclip(state);
}
