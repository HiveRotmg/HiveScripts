import { Hive } from '@hive/sdk';
import { LIMITS } from '../config/constants.mjs?rev=combat-range-20260714';

export function pathfindingWalkTo(controller, x, y, arriveThreshold) {
  if (controller.state.autoDodgeEnabled) {
    Hive.walking.enableAutoDodge({ safeWalk: true });
  }
  return Hive.walking.pathfindingWalkTo(x, y, arriveThreshold);
}

export function combatPathfindingWalkTo(controller, x, y) {
  if (controller.state.autoDodgeEnabled) {
    Hive.walking.enableAutoDodge({ safeWalk: true });
  }
  return Hive.walking.pathfindingWalkToCombatTarget(x, y, {
    minimumEnemyDistance: LIMITS.enemyExclusionDistanceTiles,
    preferredRangeRatio: LIMITS.preferredCombatRangeRatio,
  });
}
