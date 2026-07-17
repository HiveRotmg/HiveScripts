import { Branch } from '@hive/sdk';
import { isSantaWorkshopMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Santa Workshop solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SantaWorkshopBranch extends Branch {
  constructor(controller) {
    super("Santa Workshop");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSantaWorkshopMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
