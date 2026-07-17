import { Branch } from '@hive/sdk';
import { isSnakePitMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Snake Pit solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SnakePitBranch extends Branch {
  constructor(controller) {
    super("Snake Pit");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSnakePitMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
