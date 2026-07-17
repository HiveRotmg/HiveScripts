import { Branch } from '@hive/sdk';
import { isLairOfDraconisMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Lair of Draconis solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class LairOfDraconisBranch extends Branch {
  constructor(controller) {
    super("Lair of Draconis");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isLairOfDraconisMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
