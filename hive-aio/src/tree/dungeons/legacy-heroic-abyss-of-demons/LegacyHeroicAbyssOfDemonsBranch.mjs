import { Branch } from '@hive/sdk';
import { isLegacyHeroicAbyssOfDemonsMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Legacy Heroic Abyss of Demons solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class LegacyHeroicAbyssOfDemonsBranch extends Branch {
  constructor(controller) {
    super("Legacy Heroic Abyss of Demons");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isLegacyHeroicAbyssOfDemonsMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
