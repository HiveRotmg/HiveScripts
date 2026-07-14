import { Branch } from '@hive/sdk';
import { StoppedIdleLeaf } from './idle/StoppedIdleLeaf.mjs';

export class StoppedBranch extends Branch {
  constructor(controller) {
    super('Stopped');
    this.controller = controller;
    this.addLeaves(new StoppedIdleLeaf());
  }

  isValid() {
    return !this.controller.state.automationRunning;
  }
}
