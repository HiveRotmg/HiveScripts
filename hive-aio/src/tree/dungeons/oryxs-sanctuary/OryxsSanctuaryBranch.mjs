import { Branch } from '@hive/sdk';
import { isOryxsSanctuaryMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Oryx's Sanctuary solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class OryxsSanctuaryBranch extends Branch {
  constructor(controller) {
    super("Oryx's Sanctuary");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isOryxsSanctuaryMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
