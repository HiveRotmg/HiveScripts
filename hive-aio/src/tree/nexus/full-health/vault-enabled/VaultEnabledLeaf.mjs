import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

export class VaultEnabledLeaf extends Leaf {
  constructor(controller) {
    super('Vault Enabled Placeholder');
    this.controller = controller;
  }

  isValid() {
    return this.controller.state.vault === true;
  }

  onLoop() {
    return TIMING.placeholderPollMs;
  }
}
