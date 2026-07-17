import { Branch } from '@hive/sdk';
import { isIceCitadelMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Ice Citadel solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class IceCitadelBranch extends Branch {
  constructor(controller) {
    super("Ice Citadel");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isIceCitadelMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
