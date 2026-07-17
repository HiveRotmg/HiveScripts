import { Branch } from '@hive/sdk';
import { isMalogiaMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Malogia solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class MalogiaBranch extends Branch {
  constructor(controller) {
    super("Malogia");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isMalogiaMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
