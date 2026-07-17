import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';
import { progressTowardVault } from '../../../../storage/navigate-to-vault.mjs';

/**
 * Nexus backup for vault entry. Controllers normally own entry via
 * `progressTowardVault`; this leaf covers `state.vault` and sticky drink/equip
 * intents if a controller yields a tick.
 */
export class VaultEnabledLeaf extends Leaf {
  constructor(controller) {
    super('Enter Vault');
    this.controller = controller;
  }

  isValid() {
    const { state } = this.controller;
    return state.vault === true
      || state.drinkVaultPotionsActive === true
      || state.equipVaultUpgradesActive === true;
  }

  onLoop() {
    const { state } = this.controller;
    let message = 'Entering Vault';
    if (state.drinkVaultPotionsActive) message = 'Vault potions: entering Vault';
    else if (state.equipVaultUpgradesActive) message = 'Vault upgrades: entering Vault';

    const delay = progressTowardVault({
      key: 'vault-enabled-leaf',
      retryMs: TIMING.waypointRetryMs,
      pollMs: TIMING.nexusPollMs,
      message,
      appendActivity: (text) => this.controller.appendActivity?.(text),
    });
    return delay ?? TIMING.nexusPollMs;
  }

  reset() {}
}
