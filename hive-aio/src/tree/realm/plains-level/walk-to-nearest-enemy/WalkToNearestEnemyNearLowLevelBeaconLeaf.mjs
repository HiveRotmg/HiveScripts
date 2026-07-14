import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=combat-range-20260714';
import { combatPathfindingWalkTo } from '../../../../movement/pathfinding.mjs?rev=combat-range-20260714';

export class WalkToNearestEnemyNearLowLevelBeaconLeaf extends Leaf {
  constructor(controller, enemyTarget, route) {
    super('Walk To Enemy Near Beacon');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
    this.route = route;
  }

  isValid() {
    return this.route.isWithinSelectedBeaconRadius();
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
