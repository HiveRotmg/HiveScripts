import { Branch } from '@hive/sdk';
import { isToxicSewersMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Toxic Sewers solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ToxicSewersBranch extends Branch {
  constructor(controller) {
    super("Toxic Sewers");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isToxicSewersMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
