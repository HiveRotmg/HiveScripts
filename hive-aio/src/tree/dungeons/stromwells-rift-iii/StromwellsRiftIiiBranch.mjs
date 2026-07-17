import { Branch } from '@hive/sdk';
import { isStromwellsRiftIiiMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Stromwell's Rift III solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class StromwellsRiftIiiBranch extends Branch {
  constructor(controller) {
    super("Stromwell's Rift III");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isStromwellsRiftIiiMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
