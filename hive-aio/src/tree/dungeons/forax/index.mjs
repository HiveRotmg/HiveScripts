import { ForaxBranch } from './ForaxBranch.mjs';
import { isForaxMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "forax",
  name: "Forax",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isForaxMap,
  createBranch(controller) {
    return new ForaxBranch(controller);
  },
};
