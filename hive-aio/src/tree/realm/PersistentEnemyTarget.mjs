import { Hive } from '@hive/sdk';
import { LIMITS } from '../../config/constants.mjs';

export class PersistentEnemyTarget {
  targetObjectId = null;

  constructor(onTargetChanged = () => {}) {
    this.onTargetChanged = onTargetChanged;
  }

  reset() {
    this.setTarget(null);
  }

  select() {
    const nearest = Hive.enemies.getNearest();
    const current = this.targetObjectId === null
      ? null
      : Hive.enemies.getById(this.targetObjectId);

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
