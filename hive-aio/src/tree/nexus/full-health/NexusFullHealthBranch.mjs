import { Branch, Hive } from '@hive/sdk';
import { RealmEntryBranch } from './realm-entry/RealmEntryBranch.mjs?rev=portal-dodge-entry-20260714';
import { VaultEnabledLeaf } from './vault-enabled/VaultEnabledLeaf.mjs?rev=drink-vault-potions-20260717';

export class NexusFullHealthBranch extends Branch {
  constructor(controller) {
    super('Nexus Full Health');
    this.controller = controller;
    this.realmEntry = new RealmEntryBranch(controller);
    this.vaultEnabled = new VaultEnabledLeaf(controller);
    this.addLeaves(
      this.vaultEnabled,
      this.realmEntry,
    );
  }

  isValid() {
    const hp = Hive.self.getHP();
    const maxHp = Hive.self.getMaxHP();
    return maxHp > 0 && hp >= maxHp;
  }

  reset() {
    this.realmEntry.reset();
    this.vaultEnabled.reset();
  }
}
