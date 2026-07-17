import { Branch } from '@hive/sdk';
import { isWineCellarMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Wine Cellar solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class WineCellarBranch extends Branch {
  constructor(controller) {
    super("Wine Cellar");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isWineCellarMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
