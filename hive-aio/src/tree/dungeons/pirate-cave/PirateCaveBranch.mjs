import { Branch } from '@hive/sdk';
import { isPirateCaveMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Pirate Cave solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class PirateCaveBranch extends Branch {
  constructor(controller) {
    super("Pirate Cave");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isPirateCaveMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
