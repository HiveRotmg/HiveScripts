import { Branch } from '@hive/sdk';
import { isDreamscapeLabyrinthMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Dreamscape Labyrinth solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class DreamscapeLabyrinthBranch extends Branch {
  constructor(controller) {
    super("Dreamscape Labyrinth");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isDreamscapeLabyrinthMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
