import { Branch } from '@hive/sdk';
import { isCandylandHuntingGroundsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Candyland Hunting Grounds solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class CandylandHuntingGroundsBranch extends Branch {
  constructor(controller) {
    super("Candyland Hunting Grounds");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isCandylandHuntingGroundsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
