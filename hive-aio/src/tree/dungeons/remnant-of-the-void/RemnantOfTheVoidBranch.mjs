import { Branch } from '@hive/sdk';
import { isRemnantOfTheVoidMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Remnant of the Void solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class RemnantOfTheVoidBranch extends Branch {
  constructor(controller) {
    super("Remnant of the Void");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isRemnantOfTheVoidMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
