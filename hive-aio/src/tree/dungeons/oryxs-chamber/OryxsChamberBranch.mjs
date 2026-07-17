import { Branch } from '@hive/sdk';
import { isOryxsChamberMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Oryx's Chamber solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class OryxsChamberBranch extends Branch {
  constructor(controller) {
    super("Oryx's Chamber");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isOryxsChamberMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
