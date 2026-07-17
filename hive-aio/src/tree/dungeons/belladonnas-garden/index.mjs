import { BelladonnasGardenBranch } from './BelladonnasGardenBranch.mjs';
import { isBelladonnasGardenMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "belladonnas-garden",
  name: "Belladonna's Garden",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isBelladonnasGardenMap,
  createBranch(controller) {
    return new BelladonnasGardenBranch(controller);
  },
};
