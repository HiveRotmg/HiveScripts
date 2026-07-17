import { Branch } from '@hive/sdk';
import { isTheVoidMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Void solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheVoidBranch extends Branch {
  constructor(controller) {
    super("The Void");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheVoidMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
