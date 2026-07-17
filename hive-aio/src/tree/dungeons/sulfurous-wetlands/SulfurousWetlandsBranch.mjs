import { Branch } from '@hive/sdk';
import { isSulfurousWetlandsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Sulfurous Wetlands solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SulfurousWetlandsBranch extends Branch {
  constructor(controller) {
    super("Sulfurous Wetlands");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSulfurousWetlandsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
