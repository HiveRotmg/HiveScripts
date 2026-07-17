import { Branch } from '@hive/sdk';
import { isMountainTempleMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Mountain Temple solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class MountainTempleBranch extends Branch {
  constructor(controller) {
    super("Mountain Temple");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isMountainTempleMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
