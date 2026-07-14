import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../config/constants.mjs';

export class WaitForSupportedMapLeaf extends Leaf {
  constructor() {
    super('Wait For Nexus Or Realm');
  }

  isValid() {
    return true;
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
