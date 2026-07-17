import { Branch } from '@hive/sdk';
import { isHauntedCemeteryMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Haunted Cemetery solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class HauntedCemeteryBranch extends Branch {
  constructor(controller) {
    super("Haunted Cemetery");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isHauntedCemeteryMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
