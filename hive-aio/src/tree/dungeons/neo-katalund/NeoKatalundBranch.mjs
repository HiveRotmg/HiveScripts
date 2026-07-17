import { Branch } from '@hive/sdk';
import { isNeoKatalundMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Neo Katalund solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class NeoKatalundBranch extends Branch {
  constructor(controller) {
    super("Neo Katalund");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isNeoKatalundMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
