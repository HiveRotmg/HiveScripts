import { UntarisBranch } from './UntarisBranch.mjs';
import { isUntarisMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "untaris",
  name: "Untaris",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isUntarisMap,
  createBranch(controller) {
    return new UntarisBranch(controller);
  },
};
