import { Branch } from '@hive/sdk';
import { isRealmMap } from '../../world/map-kind.mjs';
import { DeepSeaLevelBranch } from './deep-sea-level/DeepSeaLevelBranch.mjs?rev=combat-range-20260714';
import { HighLevelBranch } from './high-level/HighLevelBranch.mjs?rev=deepsea-20260713';
import { LowLevelBranch } from './low-level/LowLevelBranch.mjs?rev=combat-range-20260714';
import { PlainsLevelBranch } from './plains-level/PlainsLevelBranch.mjs?rev=combat-range-20260714';
import { PersistentEnemyTarget } from './PersistentEnemyTarget.mjs?rev=target-selector-20260714';

export class RealmBranch extends Branch {
  constructor(controller) {
    super('Realm');
    this.controller = controller;
    this.enemyTarget = new PersistentEnemyTarget((objectId) => {
      this.controller.state.currentTargetObjectId = objectId;
    });
    this.plainsLevel = new PlainsLevelBranch(controller, this.enemyTarget);
    this.addLeaves(
      new LowLevelBranch(controller, this.enemyTarget),
      this.plainsLevel,
      new DeepSeaLevelBranch(controller, this.enemyTarget),
      new HighLevelBranch(controller),
    );
  }

  isValid() {
    return this.controller.state.automationRunning && isRealmMap();
  }

  reset() {
    this.enemyTarget.reset();
    this.plainsLevel.reset();
  }
}
