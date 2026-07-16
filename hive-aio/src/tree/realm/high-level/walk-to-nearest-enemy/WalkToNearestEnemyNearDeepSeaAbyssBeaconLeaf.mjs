import { Leaf } from '@hive/sdk';
import { LIMITS, TIMING } from '../../../../config/constants.mjs?rev=realm-exploration-20260715';
import { EnemyNavigator } from '../../../../movement/pathfinding.mjs?rev=distant-enemy-progress-20260716';
import { CircularBeaconExplorer } from '../../../../movement/exploration.mjs?rev=realm-exploration-20260715';
import {
  findNearestDeepSeaAbyssBeacon,
  isWithinDeepSeaAbyssBeaconRadius,
} from '../deep-sea-beacon.mjs?rev=teleport-sync-20260713';

export class WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf extends Leaf {
  constructor(controller, enemyTarget) {
    super('Walk To Nearest Enemy Near Deep Sea Abyss Beacon');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
    this.explorer = new CircularBeaconExplorer(
      controller,
      LIMITS.deepSeaExplorationRadiusTiles,
    );
    this.enemyNavigator = new EnemyNavigator(controller);
  }

  isValid() {
    return isWithinDeepSeaAbyssBeaconRadius(findNearestDeepSeaAbyssBeacon());
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) {
      this.enemyNavigator.reset();
      this.explorer.walk(findNearestDeepSeaAbyssBeacon());
      return TIMING.enemyRefreshMs;
    }

    if (this.enemyNavigator.walk(enemy)) {
      this.explorer.pause();
    } else {
      this.explorer.walk(findNearestDeepSeaAbyssBeacon());
    }
    return TIMING.enemyRefreshMs;
  }

  reset() {
    this.explorer.reset();
    this.enemyNavigator.reset();
  }
}
