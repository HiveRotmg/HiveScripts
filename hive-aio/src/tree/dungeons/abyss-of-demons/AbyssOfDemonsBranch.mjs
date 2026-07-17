import { Branch } from '@hive/sdk';
import { isAbyssOfDemonsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Abyss of Demons solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class AbyssOfDemonsBranch extends Branch {
  constructor(controller) {
    super("Abyss of Demons");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isAbyssOfDemonsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
