import { CrystalCavernBranch } from './CrystalCavernBranch.mjs';
import { isCrystalCavernMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "crystal-cavern",
  name: "Crystal Cavern",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCrystalCavernMap,
  createBranch(controller) {
    return new CrystalCavernBranch(controller);
  },
};
