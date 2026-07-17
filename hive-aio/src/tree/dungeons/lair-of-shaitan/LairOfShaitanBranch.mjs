import { Branch } from '@hive/sdk';
import { isLairOfShaitanMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Lair of Shaitan solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class LairOfShaitanBranch extends Branch {
  constructor(controller) {
    super("Lair of Shaitan");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isLairOfShaitanMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
