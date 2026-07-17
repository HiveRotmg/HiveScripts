import { Branch } from '@hive/sdk';
import { isParasiteChambersMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Parasite Chambers solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ParasiteChambersBranch extends Branch {
  constructor(controller) {
    super("Parasite Chambers");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isParasiteChambersMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
