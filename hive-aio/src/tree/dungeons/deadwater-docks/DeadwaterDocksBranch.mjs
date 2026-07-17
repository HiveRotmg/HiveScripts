import { Branch } from '@hive/sdk';
import { isDeadwaterDocksMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Deadwater Docks solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class DeadwaterDocksBranch extends Branch {
  constructor(controller) {
    super("Deadwater Docks");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isDeadwaterDocksMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
