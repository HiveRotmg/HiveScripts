import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=beacon-walk-fallback-20260714';
import { WalkToNearestEnemyLeaf } from '../low-level/walk-to-nearest-enemy/WalkToNearestEnemyLeaf.mjs?rev=direct-enemy-pathfinding-20260716';
import { LowLevelBeaconRoute } from './low-level-beacon-route.mjs?rev=beacon-walk-fallback-20260714';
import { TeleportToLowLevelBeaconLeaf } from './teleport-to-low-level-beacon/TeleportToLowLevelBeaconLeaf.mjs?rev=beacon-walk-fallback-20260714';
import { WalkToNearestEnemyNearLowLevelBeaconLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyNearLowLevelBeaconLeaf.mjs?rev=direct-enemy-pathfinding-20260716';

export class PlainsLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Levels 9 Through 13');
    this.controller = controller;
    this.beaconRoute = new LowLevelBeaconRoute();
    this.enemyLeaf = new WalkToNearestEnemyNearLowLevelBeaconLeaf(
      controller,
      enemyTarget,
      this.beaconRoute,
    );
    this.fallbackEnemyLeaf = new WalkToNearestEnemyLeaf(controller, enemyTarget);
    this.addLeaves(
      new TeleportToLowLevelBeaconLeaf(this.beaconRoute),
      this.enemyLeaf,
      this.fallbackEnemyLeaf,
    );
  }

  isValid() {
    const level = Hive.self.getLevel();
    return level > LIMITS.lowLevelInclusiveMaximum
      && level < LIMITS.plainsLevelExclusiveMaximum;
  }

  reset() {
    this.beaconRoute.reset();
    this.enemyLeaf.reset();
    this.fallbackEnemyLeaf.reset();
  }
}
