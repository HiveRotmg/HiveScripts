import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

export class WaitForFullHealthLeaf extends Leaf {
  constructor() {
    super('Wait For Full Health Placeholder');
  }

  isValid() {
    return true;
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
