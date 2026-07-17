import { Branch } from '@hive/sdk';
import { isAncientRuinsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Ancient Ruins solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class AncientRuinsBranch extends Branch {
  constructor(controller) {
    super("Ancient Ruins");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isAncientRuinsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
