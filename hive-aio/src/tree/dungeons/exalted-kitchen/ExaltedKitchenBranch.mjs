import { Branch } from '@hive/sdk';
import { isExaltedKitchenMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Exalted Kitchen solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ExaltedKitchenBranch extends Branch {
  constructor(controller) {
    super("Exalted Kitchen");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isExaltedKitchenMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
