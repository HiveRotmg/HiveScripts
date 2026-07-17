import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=max-level-nested-20260715';
import { AttackMaxingBranch } from './attack-maxing/AttackMaxingBranch.mjs?rev=direct-enemy-pathfinding-20260716';
import { PendingStatMaxingLeaf } from './pending-maxing/PendingStatMaxingLeaf.mjs?rev=attack-maxer-only-20260715';
import {
  ENABLE_ATTACK_MAXING_WHEN_MAXED_FOR_TESTING,
  hasUnmaxedSixEightStat,
  SIX_EIGHT_STATS,
} from './six-eight-stats.mjs?rev=attack-maxer-testing-20260715';

function randomIndex(length) {
  return Math.min(length - 1, Math.floor(Math.random() * length));
}

export class MaxLevelBranch extends Branch {
  constructor(controller, enemyTarget) {
    super('Max Level (20)');
    this.controller = controller;
    this.selectedTask = null;
    this.attackMaxing = new AttackMaxingBranch(controller, enemyTarget);
    const pendingTasks = SIX_EIGHT_STATS
      .filter(({ key }) => key !== 'attack')
      .map(({ key, taskName }) => new PendingStatMaxingLeaf(key, taskName));
    this.addLeaves(this.attackMaxing, ...pendingTasks);
  }

  isValid() {
    return Hive.self.getLevel() === LIMITS.maxLevel
      && (ENABLE_ATTACK_MAXING_WHEN_MAXED_FOR_TESTING || hasUnmaxedSixEightStat());
  }

  tick(walker) {
    if (!this.selectedTask || !walker.isValidSafe(this.selectedTask)) {
      this.selectedTask?.reset?.();
      const validTasks = this._iterateChildren().filter((task) => walker.isValidSafe(task));
      this.selectedTask = validTasks.length ? validTasks[randomIndex(validTasks.length)] : null;
    }

    if (!this.selectedTask) return walker.idle();
    if (this.selectedTask instanceof Branch) return walker.enterBranch(this.selectedTask);
    return walker.runLeaf(this.selectedTask);
  }

  reset() {
    this.selectedTask = null;
    this.attackMaxing.reset();
  }
}
