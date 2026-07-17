import { Branch } from '@hive/sdk';
import { isPuppetMastersEncoreMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Puppet Master's Encore solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class PuppetMastersEncoreBranch extends Branch {
  constructor(controller) {
    super("Puppet Master's Encore");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isPuppetMastersEncoreMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
