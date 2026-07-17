import { KatalundBranch } from './KatalundBranch.mjs';
import { isKatalundMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "katalund",
  name: "Katalund",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isKatalundMap,
  createBranch(controller) {
    return new KatalundBranch(controller);
  },
};
