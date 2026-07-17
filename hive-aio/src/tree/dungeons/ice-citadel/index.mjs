import { IceCitadelBranch } from './IceCitadelBranch.mjs';
import { isIceCitadelMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "ice-citadel",
  name: "Ice Citadel",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isIceCitadelMap,
  createBranch(controller) {
    return new IceCitadelBranch(controller);
  },
};
