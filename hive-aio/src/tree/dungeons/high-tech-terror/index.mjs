import { HighTechTerrorBranch } from './HighTechTerrorBranch.mjs';
import { isHighTechTerrorMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "high-tech-terror",
  name: "High Tech Terror",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isHighTechTerrorMap,
  createBranch(controller) {
    return new HighTechTerrorBranch(controller);
  },
};
