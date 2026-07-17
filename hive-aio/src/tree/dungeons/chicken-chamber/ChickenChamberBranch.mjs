import { Branch } from '@hive/sdk';
import { isChickenChamberMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Chicken Chamber solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ChickenChamberBranch extends Branch {
  constructor(controller) {
    super("Chicken Chamber");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isChickenChamberMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
