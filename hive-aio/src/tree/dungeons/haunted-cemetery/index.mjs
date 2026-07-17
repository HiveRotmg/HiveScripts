import { HauntedCemeteryBranch } from './HauntedCemeteryBranch.mjs';
import { isHauntedCemeteryMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "haunted-cemetery",
  name: "Haunted Cemetery",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isHauntedCemeteryMap,
  createBranch(controller) {
    return new HauntedCemeteryBranch(controller);
  },
};
