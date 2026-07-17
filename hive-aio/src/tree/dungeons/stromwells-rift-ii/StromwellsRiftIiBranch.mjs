import { Branch } from '@hive/sdk';
import { isStromwellsRiftIiMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Stromwell's Rift II solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class StromwellsRiftIiBranch extends Branch {
  constructor(controller) {
    super("Stromwell's Rift II");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isStromwellsRiftIiMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
