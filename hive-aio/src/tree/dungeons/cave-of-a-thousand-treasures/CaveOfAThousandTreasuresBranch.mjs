import { Branch } from '@hive/sdk';
import { isCaveOfAThousandTreasuresMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Cave of A Thousand Treasures solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CaveOfAThousandTreasuresBranch extends Branch {
  constructor(controller) {
    super("Cave of A Thousand Treasures");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCaveOfAThousandTreasuresMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
