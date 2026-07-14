import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs';
import { WalkToNearestEnemyLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyLeaf.mjs?rev=combat-range-20260714';

export class LowLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Level Below 8');
    this.controller = controller;
    this.addLeaves(new WalkToNearestEnemyLeaf(controller, enemyTarget));
  }

  isValid() {
    return Hive.self.getLevel() < LIMITS.lowLevelExclusiveMaximum;
  }
}
