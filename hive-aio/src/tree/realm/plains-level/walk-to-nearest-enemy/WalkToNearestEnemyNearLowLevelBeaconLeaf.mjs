import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=random-low-level-beacons-20260714';

export class WalkToNearestEnemyNearLowLevelBeaconLeaf extends Leaf {
  constructor(enemyTarget, route) {
    super('Walk To Enemy Near Beacon');
    this.enemyTarget = enemyTarget;
    this.route = route;
  }

  isValid() {
    return this.route.isWithinSelectedBeaconRadius();
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) return TIMING.enemyRefreshMs;

    Hive.walking.pathfindingWalkTo(enemy.position.x, enemy.position.y);
    return TIMING.enemyRefreshMs;
  }
}
