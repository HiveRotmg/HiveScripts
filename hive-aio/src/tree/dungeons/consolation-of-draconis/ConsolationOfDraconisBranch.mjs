import { Branch } from '@hive/sdk';
import { isConsolationOfDraconisMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Consolation of Draconis solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ConsolationOfDraconisBranch extends Branch {
  constructor(controller) {
    super("Consolation of Draconis");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isConsolationOfDraconisMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
