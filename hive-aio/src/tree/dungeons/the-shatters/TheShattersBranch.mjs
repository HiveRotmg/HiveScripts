import { Branch } from '@hive/sdk';
import { isTheShattersMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Shatters solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheShattersBranch extends Branch {
  constructor(controller) {
    super("The Shatters");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheShattersMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
