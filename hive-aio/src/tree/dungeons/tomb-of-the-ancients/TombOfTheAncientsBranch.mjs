import { Branch } from '@hive/sdk';
import { isTombOfTheAncientsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Tomb of the Ancients solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TombOfTheAncientsBranch extends Branch {
  constructor(controller) {
    super("Tomb of the Ancients");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTombOfTheAncientsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
