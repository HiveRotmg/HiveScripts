import { StromwellsRiftIiBranch } from './StromwellsRiftIiBranch.mjs';
import { isStromwellsRiftIiMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "stromwells-rift-ii",
  name: "Stromwell's Rift II",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isStromwellsRiftIiMap,
  createBranch(controller) {
    return new StromwellsRiftIiBranch(controller);
  },
};
