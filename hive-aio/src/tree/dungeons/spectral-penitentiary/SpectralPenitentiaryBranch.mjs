import { Branch } from '@hive/sdk';
import { isSpectralPenitentiaryMap } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable Spectral Penitentiary solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class SpectralPenitentiaryBranch extends Branch {
  constructor(controller) {
    super("Spectral Penitentiary");
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && isSpectralPenitentiaryMap();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
