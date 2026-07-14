import { Branch, Hive } from '@hive/sdk';
import { RealmEntryBranch } from './realm-entry/RealmEntryBranch.mjs';
import { VaultEnabledLeaf } from './vault-enabled/VaultEnabledLeaf.mjs';

export class NexusFullHealthBranch extends Branch {
  constructor(controller) {
    super('Nexus Full Health');
    this.controller = controller;
    this.realmEntry = new RealmEntryBranch(controller);
    this.addLeaves(
      this.realmEntry,
      new VaultEnabledLeaf(controller),
    );
  }

  isValid() {
    const hp = Hive.self.getHP();
    const maxHp = Hive.self.getMaxHP();
    return maxHp > 0 && hp >= maxHp;
  }

  reset() {
    this.realmEntry.reset();
  }
}
