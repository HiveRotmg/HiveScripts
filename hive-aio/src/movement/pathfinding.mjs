import { Hive } from '@hive/sdk';
import { LIMITS } from '../config/constants.mjs?rev=distant-enemy-waypoints-20260715';

const DISTANT_ENEMY_STALL_MS = 3000;
const DISTANT_ENEMY_PROGRESS_TILES = 0.25;
const APPROACH_ANGLE_OFFSETS = Object.freeze([
  0,
  Math.PI / 6,
  -Math.PI / 6,
  Math.PI / 4,
  -Math.PI / 4,
]);

export function pathfindingWalkTo(controller, x, y, arriveThreshold) {
  if (controller.state.autoDodgeEnabled) {
    return Hive.walking.navigateTo(x, y, {
      arriveThreshold,
      safeWalk: true,
      projectileJump: true,
      maxJumpDistance: 1.5,
    });
  }
  return Hive.walking.pathfindingWalkTo(x, y, arriveThreshold);
}

export function combatPathfindingWalkTo(controller, x, y) {
  const options = {
    minimumEnemyDistance: LIMITS.enemyExclusionDistanceTiles,
    preferredRangeRatio: LIMITS.preferredCombatRangeRatio,
  };
  if (controller.state.autoDodgeEnabled) {
    return Hive.walking.navigateToCombatTarget(x, y, {
      ...options,
      safeWalk: true,
      projectileJump: true,
      maxJumpDistance: 1.5,
    });
  }
  return Hive.walking.pathfindingWalkToCombatTarget(x, y, options);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function boundedApproachTarget(origin, target, attempt = 0) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const targetDistance = Math.hypot(dx, dy);
  if (!Number.isFinite(targetDistance) || targetDistance <= 0) return null;
  const step = Math.min(targetDistance, LIMITS.distantEnemyApproachStepTiles);
  const angle = APPROACH_ANGLE_OFFSETS[attempt % APPROACH_ANGLE_OFFSETS.length];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const unitX = dx / targetDistance;
  const unitY = dy / targetDistance;
  return {
    x: origin.x + (unitX * cos - unitY * sin) * step,
    y: origin.y + (unitX * sin + unitY * cos) * step,
  };
}

export class EnemyNavigator {
  constructor(controller) {
    this.controller = controller;
    this.targetObjectId = null;
    this.approachTarget = null;
    this.lastEnemyPosition = null;
    this.approachAttempt = 0;
    this.navigationIssued = false;
    this.bestApproachDistance = Infinity;
    this.lastProgressAt = 0;
  }

  reset() {
    this.targetObjectId = null;
    this.approachTarget = null;
    this.lastEnemyPosition = null;
    this.approachAttempt = 0;
    this.navigationIssued = false;
    this.bestApproachDistance = Infinity;
    this.lastProgressAt = 0;
  }

  walk(enemy) {
    if (!enemy?.position) return false;

    const enemyDistance = Hive.self.distanceTo(enemy.position);
    if (enemyDistance <= LIMITS.combatNavigationActivationDistanceTiles) {
      this.reset();
      return combatPathfindingWalkTo(
        this.controller,
        enemy.position.x,
        enemy.position.y,
      );
    }

    const now = Date.now();
    const playerPosition = Hive.self.getPosition();
    const approachDistance = this.approachTarget
      ? distance(playerPosition, this.approachTarget)
      : Infinity;
    const approachReached = this.approachTarget
      && approachDistance
        <= LIMITS.distantEnemyApproachToleranceTiles + 1;
    const targetMoved = this.lastEnemyPosition
      && distance(this.lastEnemyPosition, enemy.position)
        >= LIMITS.distantEnemyRetargetDistanceTiles;
    const targetChanged = this.targetObjectId !== enemy.objectId;

    if (this.navigationIssued
      && approachDistance <= this.bestApproachDistance - DISTANT_ENEMY_PROGRESS_TILES) {
      this.bestApproachDistance = approachDistance;
      this.lastProgressAt = now;
    }

    const navigationStopped = this.navigationIssued && !Hive.walking.isMoving();
    const navigationStalled = this.navigationIssued
      && now - this.lastProgressAt >= DISTANT_ENEMY_STALL_MS;
    if (navigationStopped || navigationStalled) {
      this.approachAttempt += 1;
      this.approachTarget = null;
      this.navigationIssued = false;
    } else if (this.navigationIssued && !targetChanged && !approachReached && !targetMoved) {
      return true;
    }

    if (targetChanged || approachReached || targetMoved) {
      this.approachAttempt = 0;
      this.approachTarget = null;
      this.navigationIssued = false;
    }

    if (!this.approachTarget) {
      const approachTarget = boundedApproachTarget(
        playerPosition,
        enemy.position,
        this.approachAttempt,
      );
      if (!approachTarget) {
        this.reset();
        return false;
      }
      this.targetObjectId = enemy.objectId;
      this.approachTarget = approachTarget;
      this.lastEnemyPosition = { ...enemy.position };
      this.bestApproachDistance = distance(playerPosition, approachTarget);
      this.lastProgressAt = now;
    }

    const started = pathfindingWalkTo(
      this.controller,
      this.approachTarget.x,
      this.approachTarget.y,
      LIMITS.distantEnemyApproachToleranceTiles,
    );
    if (!started) {
      this.approachAttempt += 1;
      this.approachTarget = null;
      this.navigationIssued = false;
      return false;
    }
    this.navigationIssued = true;
    return true;
  }
}
