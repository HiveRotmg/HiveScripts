import { Branch } from '@hive/sdk';
import { isMagicWoodsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Magic Woods solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class MagicWoodsBranch extends Branch {
  constructor(controller) {
    super("Magic Woods");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isMagicWoodsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
