import { Branch, Hive } from '@hive/sdk';
import { NexusFullHealthBranch } from './full-health/NexusFullHealthBranch.mjs?rev=nexus-healers-20260714';
import { NexusInjuredBranch } from './injured/NexusInjuredBranch.mjs?rev=nexus-healers-20260714';

export class NexusBranch extends Branch {
  constructor(controller) {
    super('Nexus');
    this.controller = controller;
    this.fullHealth = new NexusFullHealthBranch(controller);
    this.injured = new NexusInjuredBranch(controller);
    this.addLeaves(this.fullHealth, this.injured);
  }

  isValid() {
    return this.controller.state.automationRunning && Hive.world.isNexus();
  }

  reset() {
    this.fullHealth.reset();
  }
}
