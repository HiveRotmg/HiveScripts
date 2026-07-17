import { Branch } from '@hive/sdk';
import { isUndeadLairMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Undead Lair solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class UndeadLairBranch extends Branch {
  constructor(controller) {
    super("Undead Lair");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isUndeadLairMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
