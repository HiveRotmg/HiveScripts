import { Branch } from '@hive/sdk';
import { isHiddenInterregnumMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Hidden Interregnum solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class HiddenInterregnumBranch extends Branch {
  constructor(controller) {
    super("Hidden Interregnum");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isHiddenInterregnumMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
