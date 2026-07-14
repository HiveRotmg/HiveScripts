import { Branch, Hive } from '@hive/sdk';
import { WaitForFullHealthLeaf } from './wait-for-full-health/WaitForFullHealthLeaf.mjs?rev=nexus-healers-20260714';
import { WalkToNexusHealersLeaf } from './walk-to-healers/WalkToNexusHealersLeaf.mjs?rev=nexus-healers-20260714';

export class NexusInjuredBranch extends Branch {
  constructor(controller) {
    super('Nexus Not Full Health');
    this.controller = controller;
    this.addLeaves(
      new WalkToNexusHealersLeaf(controller),
      new WaitForFullHealthLeaf(),
    );
  }

  isValid() {
    const hp = Hive.self.getHP();
    const maxHp = Hive.self.getMaxHP();
    return maxHp <= 0 || hp < maxHp;
  }
}
