import { IceCaveBranch } from './IceCaveBranch.mjs';
import { isIceCaveMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "ice-cave",
  name: "Ice Cave",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isIceCaveMap,
  createBranch(controller) {
    return new IceCaveBranch(controller);
  },
};
