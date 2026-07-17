import { Branch } from '@hive/sdk';
import { isCourtOfOryxMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Court of Oryx solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CourtOfOryxBranch extends Branch {
  constructor(controller) {
    super("Court of Oryx");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCourtOfOryxMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
