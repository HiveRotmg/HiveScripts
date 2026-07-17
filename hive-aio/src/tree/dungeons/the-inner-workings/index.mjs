import { TheInnerWorkingsBranch } from './TheInnerWorkingsBranch.mjs';
import { isTheInnerWorkingsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-inner-workings",
  name: "The Inner Workings",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheInnerWorkingsMap,
  createBranch(controller) {
    return new TheInnerWorkingsBranch(controller);
  },
};
