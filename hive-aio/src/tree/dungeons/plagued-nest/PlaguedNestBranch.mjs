import { Branch } from '@hive/sdk';
import { isPlaguedNestMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Plagued Nest solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class PlaguedNestBranch extends Branch {
  constructor(controller) {
    super("Plagued Nest");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isPlaguedNestMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
