import { OryxsCastleBranch } from './OryxsCastleBranch.mjs';
import { isOryxsCastleMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "oryxs-castle",
  name: "Oryx's Castle",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isOryxsCastleMap,
  createBranch(controller) {
    return new OryxsCastleBranch(controller);
  },
};
