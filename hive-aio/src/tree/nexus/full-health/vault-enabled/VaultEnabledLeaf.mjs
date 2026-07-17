import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';
import { callOptional, stopMoving } from '../../../../sdk/compat.mjs';

/**
 * Nexus-side Vault entrance navigation.
 * Active when legacy `state.vault` is set, or when Hive AIO is retrieving
 * vault potions / vault equipment upgrades.
 */
export class VaultEnabledLeaf extends Leaf {
  constructor(controller) {
    super('Enter Vault');
    this.controller = controller;
    this.lastEnterAt = 0;
  }

  isValid() {
    const { state } = this.controller;
    return state.vault === true
      || state.drinkVaultPotionsActive === true
      || state.equipVaultUpgradesActive === true;
  }

  onLoop() {
    if (Date.now() - this.lastEnterAt < TIMING.waypointRetryMs) {
      return TIMING.nexusPollMs;
    }
    this.lastEnterAt = Date.now();
    stopMoving();
    callOptional(Hive.walking, 'enterVault');
    if (this.controller.state.drinkVaultPotionsActive) {
      this.controller.appendActivity('Vault potions: entering Vault');
    } else if (this.controller.state.equipVaultUpgradesActive) {
      this.controller.appendActivity('Vault upgrades: entering Vault');
    }
    return TIMING.nexusPollMs;
  }

  reset() {
    this.lastEnterAt = 0;
  }
}
