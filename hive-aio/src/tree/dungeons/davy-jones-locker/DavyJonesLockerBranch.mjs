import { Branch } from '@hive/sdk';
import { isDavyJonesLockerMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Davy Jones' Locker solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class DavyJonesLockerBranch extends Branch {
  constructor(controller) {
    super("Davy Jones' Locker");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isDavyJonesLockerMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
