import { Branch } from '@hive/sdk';
import { isLegacyHeroicUndeadLairMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Legacy Heroic Undead Lair solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class LegacyHeroicUndeadLairBranch extends Branch {
  constructor(controller) {
    super("Legacy Heroic Undead Lair");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isLegacyHeroicUndeadLairMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
