import { PuppetMastersTheatreBranch } from './PuppetMastersTheatreBranch.mjs';
import { isPuppetMastersTheatreMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "puppet-masters-theatre",
  name: "Puppet Master's Theatre",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isPuppetMastersTheatreMap,
  createBranch(controller) {
    return new PuppetMastersTheatreBranch(controller);
  },
};
