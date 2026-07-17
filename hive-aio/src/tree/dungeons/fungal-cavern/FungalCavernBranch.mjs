import { Branch } from '@hive/sdk';
import { isFungalCavernMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Fungal Cavern solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class FungalCavernBranch extends Branch {
  constructor(controller) {
    super("Fungal Cavern");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isFungalCavernMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
