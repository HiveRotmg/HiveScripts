import { MountainTempleBranch } from './MountainTempleBranch.mjs';
import { isMountainTempleMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "mountain-temple",
  name: "Mountain Temple",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isMountainTempleMap,
  createBranch(controller) {
    return new MountainTempleBranch(controller);
  },
};
