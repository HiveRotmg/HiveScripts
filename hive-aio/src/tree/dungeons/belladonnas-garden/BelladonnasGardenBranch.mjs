import { Branch } from '@hive/sdk';
import { isBelladonnasGardenMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Belladonna's Garden solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class BelladonnasGardenBranch extends Branch {
  constructor(controller) {
    super("Belladonna's Garden");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isBelladonnasGardenMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
