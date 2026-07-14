import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

export class HighLevelPlaceholderLeaf extends Leaf {
  constructor() {
    super('Level Above 20 Placeholder');
  }

  isValid() {
    return true;
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
