import { Hive } from '@hive/sdk';
import { LIMITS } from '../../config/constants.mjs';

export class PersistentEnemyTarget {
  targetObjectId = null;

  reset() {
    this.targetObjectId = null;
  }

  select() {
    const nearest = Hive.enemies.getNearest();
    const current = this.targetObjectId === null
      ? null
      : Hive.enemies.getById(this.targetObjectId);

    if (!current) {
      this.targetObjectId = nearest?.objectId ?? null;
      return nearest;
    }

    if (!nearest || nearest.objectId === current.objectId) return current;

    const currentDistance = Hive.self.distanceTo(current.position);
    const nearestDistance = Hive.self.distanceTo(nearest.position);
    const shouldSwitch = currentDistance - nearestDistance
      > LIMITS.enemyTargetSwitchAdvantageTiles;

    if (shouldSwitch) {
      this.targetObjectId = nearest.objectId;
      return nearest;
    }

    return current;
  }
}
