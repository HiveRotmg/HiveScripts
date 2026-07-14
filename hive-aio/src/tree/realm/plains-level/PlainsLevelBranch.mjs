import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=beacon-walk-fallback-20260714';
import { WalkToNearestEnemyLeaf } from '../low-level/walk-to-nearest-enemy/WalkToNearestEnemyLeaf.mjs';
import { LowLevelBeaconRoute } from './low-level-beacon-route.mjs?rev=beacon-walk-fallback-20260714';
import { TeleportToLowLevelBeaconLeaf } from './teleport-to-low-level-beacon/TeleportToLowLevelBeaconLeaf.mjs?rev=beacon-walk-fallback-20260714';
import { WalkToNearestEnemyNearLowLevelBeaconLeaf } from './walk-to-nearest-enemy/WalkToNearestEnemyNearLowLevelBeaconLeaf.mjs?rev=beacon-walk-fallback-20260714';

export class PlainsLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Levels 8 Through 13');
    this.controller = controller;
    this.beaconRoute = new LowLevelBeaconRoute();
    this.addLeaves(
      new TeleportToLowLevelBeaconLeaf(this.beaconRoute),
      new WalkToNearestEnemyNearLowLevelBeaconLeaf(enemyTarget, this.beaconRoute),
      new WalkToNearestEnemyLeaf(enemyTarget),
    );
  }

  isValid() {
    const level = Hive.self.getLevel();
    return level >= LIMITS.lowLevelExclusiveMaximum
      && level < LIMITS.plainsLevelExclusiveMaximum;
  }

  reset() {
    this.beaconRoute.reset();
  }
}
