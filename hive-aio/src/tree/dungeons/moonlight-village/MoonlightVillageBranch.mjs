import { Branch } from '@hive/sdk';
import { isMoonlightVillageMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Moonlight Village solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class MoonlightVillageBranch extends Branch {
  constructor(controller) {
    super("Moonlight Village");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isMoonlightVillageMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
