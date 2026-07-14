import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs';
import { WalkToNearestEnemyLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyLeaf.mjs';

export class LowLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Level Below 8');
    this.controller = controller;
    this.addLeaves(new WalkToNearestEnemyLeaf(enemyTarget));
  }

  isValid() {
    return Hive.self.getLevel() < LIMITS.lowLevelExclusiveMaximum;
  }
}
