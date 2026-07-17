import { StromwellsRiftIiiBranch } from './StromwellsRiftIiiBranch.mjs';
import { isStromwellsRiftIiiMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "stromwells-rift-iii",
  name: "Stromwell's Rift III",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isStromwellsRiftIiiMap,
  createBranch(controller) {
    return new StromwellsRiftIiiBranch(controller);
  },
};
