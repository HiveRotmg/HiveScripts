import { Branch } from '@hive/sdk';
import { isWoodlandLabyrinthMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Woodland Labyrinth solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class WoodlandLabyrinthBranch extends Branch {
  constructor(controller) {
    super("Woodland Labyrinth");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isWoodlandLabyrinthMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
