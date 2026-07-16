import { Branch } from '@hive/sdk';
import { isRealmMap } from '../../world/map-kind.mjs';
import { HighLevelBranch } from './high-level/HighLevelBranch.mjs?rev=distant-enemy-progress-20260716';
import { LowLevelBranch } from './low-level/LowLevelBranch.mjs?rev=distant-enemy-progress-20260716';
import { PlainsLevelBranch } from './plains-level/PlainsLevelBranch.mjs?rev=distant-enemy-progress-20260716';
import { PersistentEnemyTarget } from './PersistentEnemyTarget.mjs?rev=target-selector-20260714';

export class RealmBranch extends Branch {
  constructor(controller) {
    super('Realm');
    this.controller = controller;
    this.enemyTarget = new PersistentEnemyTarget((objectId) => {
      this.controller.state.currentTargetObjectId = objectId;
    });
    this.plainsLevel = new PlainsLevelBranch(controller, this.enemyTarget);
    this.highLevel = new HighLevelBranch(controller, this.enemyTarget);
    this.addLeaves(
      new LowLevelBranch(controller, this.enemyTarget),
      this.plainsLevel,
      this.highLevel,
    );
  }

  isValid() {
    return this.controller.state.automationRunning && isRealmMap();
  }

  reset() {
    this.enemyTarget.reset();
    this.plainsLevel.reset();
    this.highLevel.reset();
  }
}
