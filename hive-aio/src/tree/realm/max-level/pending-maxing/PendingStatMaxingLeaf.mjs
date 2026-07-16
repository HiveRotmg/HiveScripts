import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=max-level-nested-20260715';
import { needsSixEightStat } from '../six-eight-stats.mjs?rev=six-eight-randomizer-20260715';

export class PendingStatMaxingLeaf extends Leaf {
  constructor(statKey, taskName) {
    super(taskName);
    this.statKey = statKey;
    this.enabled = false;
  }

  isValid() {
    // These tasks are intentionally present for the maxing tree, but only
    // become selectable once their farming behavior is implemented.
    return this.enabled && needsSixEightStat(this.statKey);
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
