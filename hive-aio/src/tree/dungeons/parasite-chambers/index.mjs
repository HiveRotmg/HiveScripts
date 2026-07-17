import { ParasiteChambersBranch } from './ParasiteChambersBranch.mjs';
import { isParasiteChambersMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "parasite-chambers",
  name: "Parasite Chambers",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isParasiteChambersMap,
  createBranch(controller) {
    return new ParasiteChambersBranch(controller);
  },
};
