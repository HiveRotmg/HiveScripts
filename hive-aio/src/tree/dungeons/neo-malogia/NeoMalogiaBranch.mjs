import { Branch } from '@hive/sdk';
import { isNeoMalogiaMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Neo Malogia solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class NeoMalogiaBranch extends Branch {
  constructor(controller) {
    super("Neo Malogia");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isNeoMalogiaMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
