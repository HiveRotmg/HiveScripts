import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../config/constants.mjs';

const NEXUS_RETRY_MS = 3000;

export class ReturnToNexusFromOryxCastleLeaf extends Leaf {
  constructor(controller) {
    super("Return To Nexus From Oryx's Castle");
    this.controller = controller;
    this.lastNexusAt = Number.NEGATIVE_INFINITY;
  }

  isValid() {
    return true;
  }

  onLoop() {
    Hive.walking.stopMoving();
    if (Date.now() - this.lastNexusAt >= NEXUS_RETRY_MS) {
      this.lastNexusAt = Date.now();
      Hive.walking.nexus();
      this.controller.appendActivity?.("Unexpected Oryx's Castle; returning to Nexus");
    }
    return TIMING.nexusPollMs;
  }

  reset() {
    this.lastNexusAt = Number.NEGATIVE_INFINITY;
  }
}
