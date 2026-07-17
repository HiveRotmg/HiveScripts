import { ManorOfTheImmortalsBranch } from './ManorOfTheImmortalsBranch.mjs';
import { isManorOfTheImmortalsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "manor-of-the-immortals",
  name: "Manor of the Immortals",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isManorOfTheImmortalsMap,
  createBranch(controller) {
    return new ManorOfTheImmortalsBranch(controller);
  },
};
