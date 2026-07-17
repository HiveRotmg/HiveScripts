import { TombOfTheAncientsBranch } from './TombOfTheAncientsBranch.mjs';
import { isTombOfTheAncientsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "tomb-of-the-ancients",
  name: "Tomb of the Ancients",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTombOfTheAncientsMap,
  createBranch(controller) {
    return new TombOfTheAncientsBranch(controller);
  },
};
