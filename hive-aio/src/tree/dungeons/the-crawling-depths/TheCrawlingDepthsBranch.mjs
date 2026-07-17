import { Branch } from '@hive/sdk';
import { isTheCrawlingDepthsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Crawling Depths solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheCrawlingDepthsBranch extends Branch {
  constructor(controller) {
    super("The Crawling Depths");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheCrawlingDepthsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
