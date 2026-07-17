import { Branch } from '@hive/sdk';
import { isQueenBunnyChamberMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Queen Bunny Chamber solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class QueenBunnyChamberBranch extends Branch {
  constructor(controller) {
    super("Queen Bunny Chamber");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isQueenBunnyChamberMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
