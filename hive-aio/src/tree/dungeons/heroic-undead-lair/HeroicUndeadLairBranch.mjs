import { Branch } from '@hive/sdk';
import { isHeroicUndeadLairMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Heroic Undead Lair solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class HeroicUndeadLairBranch extends Branch {
  constructor(controller) {
    super("Heroic Undead Lair");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isHeroicUndeadLairMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
