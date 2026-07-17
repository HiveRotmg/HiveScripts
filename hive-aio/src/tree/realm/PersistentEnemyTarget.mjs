import { Hive } from '@hive/sdk';
import { LIMITS } from '../../config/constants.mjs';

export const ENEMY_IGNORE_NAMES = new Set([
  'x treasure chest',
]);

function isIgnoredEnemy(enemy) {
  const normalizedName = String(enemy?.name ?? '').trim().toLowerCase();
  return ENEMY_IGNORE_NAMES.has(normalizedName);
}

function getNearestAllowedEnemy(isAllowed) {
  const nearest = Hive.enemies.getNearest();
  if (isAllowed(nearest)) return nearest;

  return Hive.enemies.getAll()
    .filter(isAllowed)
    .reduce((closest, enemy) => {
      if (!closest) return enemy;

      const closestDistance = Hive.self.distanceTo(closest.position);
      const enemyDistance = Hive.self.distanceTo(enemy.position);
      return enemyDistance < closestDistance ? enemy : closest;
    }, null);
}

export class PersistentEnemyTarget {
  targetObjectId = null;
  rejectedPositions = new Map();

  constructor(onTargetChanged = () => {}) {
    this.onTargetChanged = onTargetChanged;
  }

  reset() {
    this.rejectedPositions.clear();
    this.setTarget(null);
  }

  reject(enemy) {
    if (!Number.isInteger(enemy?.objectId) || !enemy?.position) return;
    this.rejectedPositions.set(enemy.objectId, { ...enemy.position });
    if (this.targetObjectId === enemy.objectId) this.setTarget(null);
  }

  isAllowed(enemy) {
    if (!enemy || isIgnoredEnemy(enemy)) return false;
    const rejectedAt = this.rejectedPositions.get(enemy.objectId);
    if (!rejectedAt) return true;
    if (Math.hypot(
      enemy.position.x - rejectedAt.x,
      enemy.position.y - rejectedAt.y,
    ) >= LIMITS.rejectedEnemyMoveTolerance) {
      this.rejectedPositions.delete(enemy.objectId);
      return true;
    }
    return false;
  }

  select() {
    const isAllowed = (enemy) => this.isAllowed(enemy);
    const nearest = getNearestAllowedEnemy(isAllowed);
    const selected = this.targetObjectId === null
      ? null
      : Hive.enemies.getById(this.targetObjectId);
    const current = isAllowed(selected) ? selected : null;

    if (!current) {
      return this.setTarget(nearest);
    }

    if (!nearest || nearest.objectId === current.objectId) return this.setTarget(current);

    const currentDistance = Hive.self.distanceTo(current.position);
    const nearestDistance = Hive.self.distanceTo(nearest.position);
    const shouldSwitch = currentDistance - nearestDistance
      > LIMITS.enemyTargetSwitchAdvantageTiles;

    if (shouldSwitch) {
      return this.setTarget(nearest);
    }

    return this.setTarget(current);
  }

  setTarget(target) {
    this.targetObjectId = target?.objectId ?? null;
    this.onTargetChanged(this.targetObjectId);
    return target ?? null;
  }
}
