import { Branch } from '@hive/sdk';
import { isNeoUntarisMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Neo Untaris solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class NeoUntarisBranch extends Branch {
  constructor(controller) {
    super("Neo Untaris");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isNeoUntarisMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
