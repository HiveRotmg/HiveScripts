import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../config/constants.mjs';

export class StoppedIdleLeaf extends Leaf {
  constructor() {
    super('Stopped Idle');
  }

  isValid() {
    return true;
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
