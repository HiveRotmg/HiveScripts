import { CnidarianReefBranch } from './CnidarianReefBranch.mjs';
import { isCnidarianReefMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "cnidarian-reef",
  name: "Cnidarian Reef",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCnidarianReefMap,
  createBranch(controller) {
    return new CnidarianReefBranch(controller);
  },
};
