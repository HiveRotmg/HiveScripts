import { TheThirdDimensionBranch } from './TheThirdDimensionBranch.mjs';
import { isTheThirdDimensionMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-third-dimension",
  name: "The Third Dimension",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheThirdDimensionMap,
  createBranch(controller) {
    return new TheThirdDimensionBranch(controller);
  },
};
