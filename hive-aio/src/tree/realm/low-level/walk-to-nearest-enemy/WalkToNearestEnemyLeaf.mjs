import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

export class WalkToNearestEnemyLeaf extends Leaf {
  constructor(enemyTarget) {
    super('Walk To Nearest Enemy');
    this.enemyTarget = enemyTarget;
  }

  isValid() {
    return true;
  }

  onLoop() {
    const enemy = this.enemyTarget.select();
    if (!enemy) return TIMING.enemyRefreshMs;

    Hive.walking.pathfindingWalkTo(enemy.position.x, enemy.position.y);
    return TIMING.enemyRefreshMs;
  }
}
