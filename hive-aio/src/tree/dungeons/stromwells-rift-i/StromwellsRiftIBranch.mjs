import { Branch } from '@hive/sdk';
import { isStromwellsRiftIMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Stromwell's Rift I solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class StromwellsRiftIBranch extends Branch {
  constructor(controller) {
    super("Stromwell's Rift I");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isStromwellsRiftIMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
