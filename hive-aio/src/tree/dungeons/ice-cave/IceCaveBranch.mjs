import { Branch } from '@hive/sdk';
import { isIceCaveMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Ice Cave solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class IceCaveBranch extends Branch {
  constructor(controller) {
    super("Ice Cave");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isIceCaveMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
