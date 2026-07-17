import { Branch } from '@hive/sdk';
import { isOryxsCastleMap } from './map.mjs';
import { ReturnToNexusFromOryxCastleLeaf } from './rooms/ReturnToNexusFromOryxCastleLeaf.mjs';

/**
 * Oryx's Castle solver.
 * Activated by map detection only — not by wantedDungeon intent.
 * Safety fallback returns to Nexus until castle routing is implemented.
 */
export class OryxsCastleBranch extends Branch {
  constructor(controller) {
    super("Oryx's Castle");
    this.controller = controller;
    this.nexusFallback = new ReturnToNexusFromOryxCastleLeaf(controller);
    // Add future Oryx's Castle task leaves before this safety fallback.
    this.addLeaves(this.nexusFallback);
  }

  isValid() {
    return this.controller.state.automationRunning && isOryxsCastleMap();
  }

  reset() {
    this.nexusFallback.reset();
  }
}
