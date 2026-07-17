import { Branch } from '@hive/sdk';
import { isBilgewatersGrottoMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Bilgewater's Grotto solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class BilgewatersGrottoBranch extends Branch {
  constructor(controller) {
    super("Bilgewater's Grotto");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isBilgewatersGrottoMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
