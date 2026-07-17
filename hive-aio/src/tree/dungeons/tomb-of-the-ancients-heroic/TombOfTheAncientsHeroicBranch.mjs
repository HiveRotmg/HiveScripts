import { Branch } from '@hive/sdk';
import { isTombOfTheAncientsHeroicMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Tomb of the Ancients (Heroic) solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TombOfTheAncientsHeroicBranch extends Branch {
  constructor(controller) {
    super("Tomb of the Ancients (Heroic)");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTombOfTheAncientsHeroicMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
