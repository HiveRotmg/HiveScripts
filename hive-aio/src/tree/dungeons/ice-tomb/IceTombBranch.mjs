import { Branch } from '@hive/sdk';
import { isIceTombMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Ice Tomb solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class IceTombBranch extends Branch {
  constructor(controller) {
    super("Ice Tomb");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isIceTombMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
