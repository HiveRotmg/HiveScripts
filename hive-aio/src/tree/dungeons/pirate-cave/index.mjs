import { PirateCaveBranch } from './PirateCaveBranch.mjs';
import { isPirateCaveMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "pirate-cave",
  name: "Pirate Cave",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isPirateCaveMap,
  createBranch(controller) {
    return new PirateCaveBranch(controller);
  },
};
