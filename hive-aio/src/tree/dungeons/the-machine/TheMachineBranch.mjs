import { Branch } from '@hive/sdk';
import { isTheMachineMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Machine solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheMachineBranch extends Branch {
  constructor(controller) {
    super("The Machine");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheMachineMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
