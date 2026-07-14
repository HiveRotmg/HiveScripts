import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=combat-range-20260714';
import { combatPathfindingWalkTo } from '../../../../movement/pathfinding.mjs?rev=combat-range-20260714';
import {
  findNearestDeepSeaAbyssBeacon,
  isWithinDeepSeaAbyssBeaconRadius,
} from '../deep-sea-beacon.mjs?rev=teleport-sync-20260713';

export class WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf extends Leaf {
  constructor(controller, enemyTarget) {
    super('Walk To Nearest Enemy Near Deep Sea Abyss Beacon');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
  }

  isValid() {
    return isWithinDeepSeaAbyssBeaconRadius(findNearestDeepSeaAbyssBeacon());
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) return TIMING.enemyRefreshMs;

    combatPathfindingWalkTo(
      this.controller,
      enemy.position.x,
      enemy.position.y,
    );
    return TIMING.enemyRefreshMs;
  }
}
