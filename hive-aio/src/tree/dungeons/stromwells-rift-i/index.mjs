import { StromwellsRiftIBranch } from './StromwellsRiftIBranch.mjs';
import { isStromwellsRiftIMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "stromwells-rift-i",
  name: "Stromwell's Rift I",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isStromwellsRiftIMap,
  createBranch(controller) {
    return new StromwellsRiftIBranch(controller);
  },
};
