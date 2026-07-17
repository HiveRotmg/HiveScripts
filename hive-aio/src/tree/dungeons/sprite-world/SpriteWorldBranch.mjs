import { Branch } from '@hive/sdk';
import { isSpriteWorldMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Sprite World solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SpriteWorldBranch extends Branch {
  constructor(controller) {
    super("Sprite World");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSpriteWorldMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
