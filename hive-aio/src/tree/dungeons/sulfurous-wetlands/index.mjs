import { SulfurousWetlandsBranch } from './SulfurousWetlandsBranch.mjs';
import { isSulfurousWetlandsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "sulfurous-wetlands",
  name: "Sulfurous Wetlands",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSulfurousWetlandsMap,
  createBranch(controller) {
    return new SulfurousWetlandsBranch(controller);
  },
};
