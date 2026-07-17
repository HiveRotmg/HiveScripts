import { Branch } from '@hive/sdk';
import { isUntarisMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Untaris solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class UntarisBranch extends Branch {
  constructor(controller) {
    super("Untaris");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isUntarisMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
