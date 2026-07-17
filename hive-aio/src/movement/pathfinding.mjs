import { Hive } from '@hive/sdk';
import { LIMITS } from '../config/constants.mjs';
import { supportsModernNavigation } from '../sdk/compat.mjs';

const ENEMY_REPLAN_MS = 250;

export function pathfindingWalkTo(controller, x, y, arriveThreshold) {
  if (controller.state.autoDodgeEnabled && supportsModernNavigation()) {
    const options = {
      safeWalk: true,
      projectileJump: true,
      maxJumpDistance: 1.5,
    };
    if (Number.isFinite(arriveThreshold)) options.arriveThreshold = arriveThreshold;
    return Hive.walking.navigateTo(x, y, options);
  }
  if (typeof Hive.walking.pathfindingWalkTo === 'function') {
    return Hive.walking.pathfindingWalkTo(x, y, arriveThreshold);
  }
  return Hive.walking.walkTo(x, y);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getNavigationState() {
  try {
    return typeof Hive.walking.getNavigationState === 'function'
      ? Hive.walking.getNavigationState()
      : null;
  } catch {
    return null;
  }
}

function isNavigationMoving() {
  try {
    return typeof Hive.walking.isMoving === 'function' ? Hive.walking.isMoving() : null;
  } catch {
    return null;
  }
}

function hasReachedEnemy(enemy) {
  try {
    return Hive.self.distanceTo(enemy.position) <= LIMITS.enemyApproachTolerance;
  } catch {
    return false;
  }
}

export class EnemyNavigator {
  constructor(controller, enemyTarget = null) {
    this.controller = controller;
    this.enemyTarget = enemyTarget;
    this.targetObjectId = null;
    this.lastEnemyPosition = null;
    this.lastNavigationAt = -Infinity;
  }

  reset() {
    this.targetObjectId = null;
    this.lastEnemyPosition = null;
    this.lastNavigationAt = -Infinity;
  }

  walk(enemy) {
    if (!enemy?.position) return false;

    const now = Date.now();
    const targetChanged = this.targetObjectId !== enemy.objectId;
    const targetMoved = this.lastEnemyPosition
      && distance(this.lastEnemyPosition, enemy.position) > 0;
    const replanDue = now - this.lastNavigationAt >= ENEMY_REPLAN_MS;
    const navigation = getNavigationState();

    const navigationTargetsEnemy = navigation?.target
      && distance(navigation.target, enemy.position) < 0.05;
    if (!targetChanged && navigation?.status === 'no_path' && navigationTargetsEnemy) {
      this.enemyTarget?.reject?.(enemy);
      this.reset();
      return false;
    }

    if (!targetChanged && (!targetMoved || !replanDue)) {
      const moving = isNavigationMoving();
      if (moving !== false || navigation?.status === 'dodge_blocked' || hasReachedEnemy(enemy)) {
        return true;
      }
    }

    const started = pathfindingWalkTo(
      this.controller,
      enemy.position.x,
      enemy.position.y,
      LIMITS.enemyApproachTolerance,
    );
    if (started) {
      this.targetObjectId = enemy.objectId;
      this.lastEnemyPosition = { ...enemy.position };
      this.lastNavigationAt = now;
    }
    return started;
  }
}
