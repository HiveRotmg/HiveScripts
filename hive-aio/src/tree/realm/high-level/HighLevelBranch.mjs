import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=max-level-nested-20260715';
import { TeleportToDeepSeaAbyssBeaconLeaf } from './teleport-to-deep-sea-abyss-beacon/TeleportToDeepSeaAbyssBeaconLeaf.mjs?rev=teleport-sync-20260713';
import { WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf.mjs?rev=direct-enemy-pathfinding-20260716';
import { MaxLevelBranch } from '../max-level/MaxLevelBranch.mjs?rev=direct-enemy-pathfinding-20260716';

export class HighLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('High Level (14 Through 20)');
    this.controller = controller;
    this.maxLevel = new MaxLevelBranch(controller, enemyTarget);
    this.enemyLeaf = new WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf(controller, enemyTarget);
    this.addLeaves(
      this.maxLevel,
      new TeleportToDeepSeaAbyssBeaconLeaf(),
      this.enemyLeaf,
    );
  }

  isValid() {
    const level = Hive.self.getLevel();
    return level >= LIMITS.plainsLevelExclusiveMaximum
      && level <= LIMITS.highLevelInclusiveMaximum;
  }

  reset() {
    this.maxLevel.reset();
    this.enemyLeaf.reset();
  }
}
