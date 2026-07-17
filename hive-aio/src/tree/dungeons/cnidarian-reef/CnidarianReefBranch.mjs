import { Branch } from '@hive/sdk';
import { isCnidarianReefMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Cnidarian Reef solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CnidarianReefBranch extends Branch {
  constructor(controller) {
    super("Cnidarian Reef");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCnidarianReefMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
