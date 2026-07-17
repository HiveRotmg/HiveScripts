import { CursedLibraryBranch } from './CursedLibraryBranch.mjs';
import { isCursedLibraryMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "cursed-library",
  name: "Cursed Library",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCursedLibraryMap,
  createBranch(controller) {
    return new CursedLibraryBranch(controller);
  },
};
