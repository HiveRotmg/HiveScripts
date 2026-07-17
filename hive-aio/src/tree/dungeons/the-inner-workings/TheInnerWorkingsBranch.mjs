import { Branch } from '@hive/sdk';
import { isTheInnerWorkingsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Inner Workings solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheInnerWorkingsBranch extends Branch {
  constructor(controller) {
    super("The Inner Workings");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheInnerWorkingsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
