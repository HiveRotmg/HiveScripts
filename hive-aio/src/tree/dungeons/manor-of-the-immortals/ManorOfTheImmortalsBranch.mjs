import { Branch } from '@hive/sdk';
import { isManorOfTheImmortalsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Manor of the Immortals solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ManorOfTheImmortalsBranch extends Branch {
  constructor(controller) {
    super("Manor of the Immortals");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isManorOfTheImmortalsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
