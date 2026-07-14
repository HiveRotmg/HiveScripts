import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=deepsea-20260713';
import { TeleportToDeepSeaAbyssBeaconLeaf } from './teleport-to-deep-sea-abyss-beacon/TeleportToDeepSeaAbyssBeaconLeaf.mjs?rev=teleport-sync-20260713';
import { WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf.mjs?rev=teleport-sync-20260713';

export class DeepSeaLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Levels 14 Through 20');
    this.controller = controller;
    this.addLeaves(
      new TeleportToDeepSeaAbyssBeaconLeaf(),
      new WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf(enemyTarget),
    );
  }

  isValid() {
    const level = Hive.self.getLevel();
    return level >= LIMITS.plainsLevelExclusiveMaximum
      && level <= LIMITS.deepSeaLevelInclusiveMaximum;
  }
}
