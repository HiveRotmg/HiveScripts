import { Branch } from '@hive/sdk';
import { isOryxCastleMap } from '../../world/map-kind.mjs?rev=oryx-castle-safety-20260715';
import { ReturnToNexusFromOryxCastleLeaf } from './return-to-nexus/ReturnToNexusFromOryxCastleLeaf.mjs?rev=oryx-castle-safety-v2-20260715';

export class OryxCastleBranch extends Branch {
  constructor(controller) {
    super("Oryx's Castle");
    this.controller = controller;
    this.nexusFallback = new ReturnToNexusFromOryxCastleLeaf(controller);

    // Add future Oryx's Castle task leaves before this safety fallback.
    this.addLeaves(this.nexusFallback);
  }

  isValid() {
    return this.controller.state.automationRunning && isOryxCastleMap();
  }

  reset() {
    this.nexusFallback.reset();
  }
}
