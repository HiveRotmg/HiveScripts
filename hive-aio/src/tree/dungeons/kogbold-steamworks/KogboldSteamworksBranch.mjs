import { Branch } from '@hive/sdk';
import { isKogboldSteamworksMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Kogbold Steamworks solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class KogboldSteamworksBranch extends Branch {
  constructor(controller) {
    super("Kogbold Steamworks");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isKogboldSteamworksMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
