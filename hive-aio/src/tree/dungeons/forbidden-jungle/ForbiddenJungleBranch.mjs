import { Branch } from '@hive/sdk';
import { isForbiddenJungleMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Forbidden Jungle solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ForbiddenJungleBranch extends Branch {
  constructor(controller) {
    super("Forbidden Jungle");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isForbiddenJungleMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
