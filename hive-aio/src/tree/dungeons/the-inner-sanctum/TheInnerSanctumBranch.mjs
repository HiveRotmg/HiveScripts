import { Branch } from '@hive/sdk';
import { isTheInnerSanctumMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Inner Sanctum solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheInnerSanctumBranch extends Branch {
  constructor(controller) {
    super("The Inner Sanctum");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheInnerSanctumMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
