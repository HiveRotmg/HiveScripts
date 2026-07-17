import { TheShattersBranch } from './TheShattersBranch.mjs';
import { isTheShattersMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-shatters",
  name: "The Shatters",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheShattersMap,
  createBranch(controller) {
    return new TheShattersBranch(controller);
  },
};
