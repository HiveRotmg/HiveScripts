import { ForbiddenJungleBranch } from './ForbiddenJungleBranch.mjs';
import { isForbiddenJungleMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "forbidden-jungle",
  name: "Forbidden Jungle",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isForbiddenJungleMap,
  createBranch(controller) {
    return new ForbiddenJungleBranch(controller);
  },
};
