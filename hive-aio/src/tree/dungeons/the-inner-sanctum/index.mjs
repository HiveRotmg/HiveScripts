import { TheInnerSanctumBranch } from './TheInnerSanctumBranch.mjs';
import { isTheInnerSanctumMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-inner-sanctum",
  name: "The Inner Sanctum",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheInnerSanctumMap,
  createBranch(controller) {
    return new TheInnerSanctumBranch(controller);
  },
};
