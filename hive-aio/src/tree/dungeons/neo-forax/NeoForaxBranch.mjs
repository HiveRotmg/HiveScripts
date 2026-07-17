import { Branch } from '@hive/sdk';
import { isNeoForaxMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Neo Forax solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class NeoForaxBranch extends Branch {
  constructor(controller) {
    super("Neo Forax");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isNeoForaxMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
