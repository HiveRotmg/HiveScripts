import { Branch } from '@hive/sdk';
import { isMadLabMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Mad Lab solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class MadLabBranch extends Branch {
  constructor(controller) {
    super("Mad Lab");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isMadLabMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
