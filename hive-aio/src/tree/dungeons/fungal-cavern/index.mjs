import { FungalCavernBranch } from './FungalCavernBranch.mjs';
import { isFungalCavernMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "fungal-cavern",
  name: "Fungal Cavern",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isFungalCavernMap,
  createBranch(controller) {
    return new FungalCavernBranch(controller);
  },
};
