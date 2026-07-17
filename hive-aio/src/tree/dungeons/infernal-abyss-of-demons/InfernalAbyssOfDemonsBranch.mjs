import { Branch } from '@hive/sdk';
import { isInfernalAbyssOfDemonsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Infernal Abyss of Demons solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class InfernalAbyssOfDemonsBranch extends Branch {
  constructor(controller) {
    super("Infernal Abyss of Demons");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isInfernalAbyssOfDemonsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
