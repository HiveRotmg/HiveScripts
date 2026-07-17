import { OceanTrenchBranch } from './OceanTrenchBranch.mjs';
import { isOceanTrenchMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "ocean-trench",
  name: "Ocean Trench",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isOceanTrenchMap,
  createBranch(controller) {
    return new OceanTrenchBranch(controller);
  },
};
