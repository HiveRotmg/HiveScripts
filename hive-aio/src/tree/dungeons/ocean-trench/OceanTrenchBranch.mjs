import { Branch } from '@hive/sdk';
import { isOceanTrenchMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Ocean Trench solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class OceanTrenchBranch extends Branch {
  constructor(controller) {
    super("Ocean Trench");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isOceanTrenchMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
