import { Branch } from '@hive/sdk';
import { TeleportToDeepSeaAbyssBeaconLeaf } from '../../high-level/teleport-to-deep-sea-abyss-beacon/TeleportToDeepSeaAbyssBeaconLeaf.mjs?rev=teleport-sync-20260713';
import { WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf } from '../../high-level/walk-to-nearest-enemy/WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf.mjs?rev=distant-enemy-progress-20260716';
import {
  ENABLE_ATTACK_MAXING_WHEN_MAXED_FOR_TESTING,
  needsSixEightStat,
} from '../six-eight-stats.mjs?rev=attack-maxer-testing-20260715';

export class AttackMaxingBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Attack-Maxing');
    this.enemyLeaf = new WalkToNearestEnemyNearDeepSeaAbyssBeaconLeaf(controller, enemyTarget);
    this.addLeaves(
      new TeleportToDeepSeaAbyssBeaconLeaf(),
      this.enemyLeaf,
    );
  }

  isValid() {
    // Attack-Maxing normally stops at the natural Attack cap. This override
    // intentionally keeps it available while testing the level-20 route.
    return ENABLE_ATTACK_MAXING_WHEN_MAXED_FOR_TESTING || needsSixEightStat('attack');
  }

  reset() {
    this.enemyLeaf.reset();
  }
}
