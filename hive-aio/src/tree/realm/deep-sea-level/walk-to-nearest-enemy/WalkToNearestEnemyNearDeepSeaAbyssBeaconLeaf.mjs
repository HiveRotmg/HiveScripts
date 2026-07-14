import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=deepsea-20260713';
import {
  findNearestDeepSeaAbyssBeacon,
  isWithinDeepSeaAbyssBeaconRadius,
} from '../deep-sea-beacon.mjs?rev=teleport-sync-20260713';

export class WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf extends Leaf {
  constructor(enemyTarget) {
    super('Walk To Nearest Enemy Near Deep Sea Abyss Beacon');
    this.enemyTarget = enemyTarget;
  }

  isValid() {
    return isWithinDeepSeaAbyssBeaconRadius(findNearestDeepSeaAbyssBeacon());
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) return TIMING.enemyRefreshMs;

    Hive.walking.pathfindingWalkTo(enemy.position.x, enemy.position.y);
    return TIMING.enemyRefreshMs;
  }
}
