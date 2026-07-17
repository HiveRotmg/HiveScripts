import { PuppetMastersEncoreBranch } from './PuppetMastersEncoreBranch.mjs';
import { isPuppetMastersEncoreMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "puppet-masters-encore",
  name: "Puppet Master's Encore",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isPuppetMastersEncoreMap,
  createBranch(controller) {
    return new PuppetMastersEncoreBranch(controller);
  },
};
