import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=combat-range-20260714';
import { combatPathfindingWalkTo } from '../../../../movement/pathfinding.mjs?rev=combat-range-20260714';

export class WalkToNearestEnemyLeaf extends Leaf {
  constructor(controller, enemyTarget) {
    super('Walk To Nearest Enemy');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
  }

  isValid() {
    return true;
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
