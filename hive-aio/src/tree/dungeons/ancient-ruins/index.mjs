import { AncientRuinsBranch } from './AncientRuinsBranch.mjs';
import { isAncientRuinsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "ancient-ruins",
  name: "Ancient Ruins",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isAncientRuinsMap,
  createBranch(controller) {
    return new AncientRuinsBranch(controller);
  },
};
