import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=combat-range-20260714';
import { EnemyNavigator } from '../../../../movement/pathfinding.mjs?rev=distant-enemy-progress-20260716';
import { walkTowardRealmCenter } from '../../../../movement/exploration.mjs?rev=realm-exploration-20260715';

export class WalkToNearestEnemyLeaf extends Leaf {
  constructor(controller, enemyTarget, walkToCenterWhenEmpty = false) {
    super('Walk To Nearest Enemy');
    this.controller = controller;
    this.enemyTarget = enemyTarget;
    this.walkToCenterWhenEmpty = walkToCenterWhenEmpty;
    this.enemyNavigator = new EnemyNavigator(controller);
  }

  isValid() {
    return true;
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) {
      this.enemyNavigator.reset();
      if (this.walkToCenterWhenEmpty) walkTowardRealmCenter(this.controller);
      return TIMING.enemyRefreshMs;
    }

    const moving = this.enemyNavigator.walk(enemy);
    if (!moving && this.walkToCenterWhenEmpty) walkTowardRealmCenter(this.controller);
    return TIMING.enemyRefreshMs;
  }
}
