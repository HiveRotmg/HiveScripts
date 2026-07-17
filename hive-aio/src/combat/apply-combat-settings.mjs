import { Hive } from '@hive/sdk';
import { isRealmMap, isTutorialMap } from '../world/map-kind.mjs';
import { callOptional } from '../sdk/compat.mjs';

export function disableCombatAutomation() {
  callOptional(Hive.combat, 'disableAutoAim');
  callOptional(Hive.combat, 'disableAutoAbility');
  callOptional(Hive.combat, 'disableProjectileNoclip');
  callOptional(Hive.walking, 'disableAutoDodge');
}

function applyProjectileNoclip(state) {
  if (state.projectileNoclipEnabled) {
    callOptional(Hive.combat, 'enableProjectileNoclip');
  } else {
    callOptional(Hive.combat, 'disableProjectileNoclip');
  }
}

function applyAutoDodge(state) {
  if (state.autoDodgeEnabled) {
    callOptional(Hive.walking, 'enableAutoDodge', {
      safeWalk: true,
      projectileJump: true,
      maxJumpDistance: 1.5,
    });
  } else {
    callOptional(Hive.walking, 'disableAutoDodge');
  }
}

function allowsCombatAutomation() {
  return isRealmMap() || isTutorialMap();
}

export function applyCombatSettings(state) {
  if (!state.automationRunning) {
    disableCombatAutomation();
    return;
  }

  // Combined dodge owns movement toward every direct or pathfinding goal,
  // including safe movement and non-Realm navigation.
  applyAutoDodge(state);

  if (!allowsCombatAutomation()) {
    callOptional(Hive.combat, 'disableAutoAim');
    callOptional(Hive.combat, 'disableAutoAbility');
    applyProjectileNoclip(state);
    return;
  }

  if (state.autoAimEnabled) {
    callOptional(Hive.combat, 'enableAutoAim', {
      mode: 'closest',
      bossPriority: false,
    });
  } else {
    callOptional(Hive.combat, 'disableAutoAim');
  }

  if (state.autoAbilityEnabled) {
    callOptional(Hive.combat, 'enableAutoAbility');
  } else {
    callOptional(Hive.combat, 'disableAutoAbility');
  }

  applyProjectileNoclip(state);
}
