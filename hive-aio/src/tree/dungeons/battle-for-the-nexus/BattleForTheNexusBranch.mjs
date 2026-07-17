import { Branch } from '@hive/sdk';
import { isBattleForTheNexusMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Battle for the Nexus solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class BattleForTheNexusBranch extends Branch {
  constructor(controller) {
    super("Battle for the Nexus");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isBattleForTheNexusMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
