import { Branch } from '@hive/sdk';
import { isHighTechTerrorMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable High Tech Terror solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class HighTechTerrorBranch extends Branch {
  constructor(controller) {
    super("High Tech Terror");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isHighTechTerrorMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
