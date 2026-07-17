import { Branch } from '@hive/sdk';
import { isKitchenMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Kitchen solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class KitchenBranch extends Branch {
  constructor(controller) {
    super("Kitchen");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isKitchenMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
