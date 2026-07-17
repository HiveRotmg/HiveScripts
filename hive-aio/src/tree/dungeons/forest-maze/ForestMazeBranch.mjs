import { Branch } from '@hive/sdk';
import { isForestMazeMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Forest Maze solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ForestMazeBranch extends Branch {
  constructor(controller) {
    super("Forest Maze");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isForestMazeMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
