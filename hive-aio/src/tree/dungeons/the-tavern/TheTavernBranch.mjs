import { Branch } from '@hive/sdk';
import { isTheTavernMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable The Tavern solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class TheTavernBranch extends Branch {
  constructor(controller) {
    super("The Tavern");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isTheTavernMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
