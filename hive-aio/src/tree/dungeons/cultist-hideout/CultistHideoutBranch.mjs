import { Branch } from '@hive/sdk';
import { isCultistHideoutMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Cultist Hideout solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CultistHideoutBranch extends Branch {
  constructor(controller) {
    super("Cultist Hideout");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCultistHideoutMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
