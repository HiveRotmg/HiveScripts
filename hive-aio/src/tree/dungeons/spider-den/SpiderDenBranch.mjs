import { Branch } from '@hive/sdk';
import { isSpiderDenMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Spider Den solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SpiderDenBranch extends Branch {
  constructor(controller) {
    super("Spider Den");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSpiderDenMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
