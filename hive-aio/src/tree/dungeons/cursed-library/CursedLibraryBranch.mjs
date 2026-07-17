import { Branch } from '@hive/sdk';
import { isCursedLibraryMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Cursed Library solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CursedLibraryBranch extends Branch {
  constructor(controller) {
    super("Cursed Library");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCursedLibraryMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
