import { Leaf } from '@hive/sdk';
import { LIMITS, TIMING } from '../../../../config/constants.mjs?rev=realm-exploration-20260715';
import { EnemyNavigator } from '../../../../movement/pathfinding.mjs?rev=direct-enemy-pathfinding-20260716';
import { CircularBeaconExplorer } from '../../../../movement/exploration.mjs?rev=realm-exploration-20260715';

export class WalkToNearestEnemyNearLowLevelBeaconLeaf extends Leaf {
  constructor(controller, enemyTarget, route) {
    super('Walk To Enemy Near Beacon');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
    this.route = route;
    this.explorer = new CircularBeaconExplorer(
      controller,
      LIMITS.plainsExplorationRadiusTiles,
    );
    this.enemyNavigator = new EnemyNavigator(controller, enemyTarget);
  }

  isValid() {
    return this.route.isWithinSelectedBeaconRadius();
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) {
      this.enemyNavigator.reset();
      this.explorer.walk(this.route.getSelectedBeacon());
      return TIMING.enemyRefreshMs;
    }

    if (this.enemyNavigator.walk(enemy)) {
      this.explorer.pause();
    } else {
      this.explorer.walk(this.route.getSelectedBeacon());
    }
    return TIMING.enemyRefreshMs;
  }

  reset() {
    this.explorer.reset();
    this.enemyNavigator.reset();
  }
}
