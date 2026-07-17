import { HiddenInterregnumBranch } from './HiddenInterregnumBranch.mjs';
import { isHiddenInterregnumMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "hidden-interregnum",
  name: "Hidden Interregnum",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isHiddenInterregnumMap,
  createBranch(controller) {
    return new HiddenInterregnumBranch(controller);
  },
};
