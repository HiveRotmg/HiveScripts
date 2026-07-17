import { PlaguedNestBranch } from './PlaguedNestBranch.mjs';
import { isPlaguedNestMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "plagued-nest",
  name: "Plagued Nest",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isPlaguedNestMap,
  createBranch(controller) {
    return new PlaguedNestBranch(controller);
  },
};
