import { Branch } from '@hive/sdk';
import { isCrystalCavernMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Crystal Cavern solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CrystalCavernBranch extends Branch {
  constructor(controller) {
    super("Crystal Cavern");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCrystalCavernMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
