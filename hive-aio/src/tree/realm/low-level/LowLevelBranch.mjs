import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs';
import { WalkToNearestEnemyLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyLeaf.mjs?rev=direct-enemy-pathfinding-20260716';

export class LowLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Levels 1 Through 8');
    this.controller = controller;
    this.enemyLeaf = new WalkToNearestEnemyLeaf(controller, enemyTarget, true);
    this.addLeaves(this.enemyLeaf);
  }

  isValid() {
    return Hive.self.getLevel() <= LIMITS.lowLevelInclusiveMaximum;
  }

  reset() {
    this.enemyLeaf.reset();
  }
}
