import { Branch } from '@hive/sdk';
import { isPuppetMastersTheatreMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Puppet Master's Theatre solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class PuppetMastersTheatreBranch extends Branch {
  constructor(controller) {
    super("Puppet Master's Theatre");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isPuppetMastersTheatreMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
