import { Branch } from '@hive/sdk';
import { isForaxMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Forax solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ForaxBranch extends Branch {
  constructor(controller) {
    super("Forax");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isForaxMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
