import { Branch } from '@hive/sdk';
import { isLostHallsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Lost Halls solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class LostHallsBranch extends Branch {
  constructor(controller) {
    super("Lost Halls");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isLostHallsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
