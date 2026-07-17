import { LostHallsBranch } from './LostHallsBranch.mjs';
import { isLostHallsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "lost-halls",
  name: "Lost Halls",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isLostHallsMap,
  createBranch(controller) {
    return new LostHallsBranch(controller);
  },
};
