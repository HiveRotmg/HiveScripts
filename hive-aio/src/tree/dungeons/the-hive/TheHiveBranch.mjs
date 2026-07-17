import { Branch } from '@hive/sdk';
import { isTheHiveMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Hive solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheHiveBranch extends Branch {
  constructor(controller) {
    super("The Hive");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheHiveMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
