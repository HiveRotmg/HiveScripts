import { Branch } from '@hive/sdk';
import { isKatalundMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Katalund solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class KatalundBranch extends Branch {
  constructor(controller) {
    super("Katalund");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isKatalundMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
