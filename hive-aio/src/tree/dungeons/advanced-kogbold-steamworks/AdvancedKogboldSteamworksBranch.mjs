import { Branch } from '@hive/sdk';
import { isAdvancedKogboldSteamworksMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Advanced Kogbold Steamworks solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class AdvancedKogboldSteamworksBranch extends Branch {
  constructor(controller) {
    super("Advanced Kogbold Steamworks");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isAdvancedKogboldSteamworksMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
