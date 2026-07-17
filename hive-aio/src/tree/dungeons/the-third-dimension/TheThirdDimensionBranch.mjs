import { Branch } from '@hive/sdk';
import { isTheThirdDimensionMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Third Dimension solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheThirdDimensionBranch extends Branch {
  constructor(controller) {
    super("The Third Dimension");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheThirdDimensionMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
