import { BilgewatersGrottoBranch } from './BilgewatersGrottoBranch.mjs';
import { isBilgewatersGrottoMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "bilgewaters-grotto",
  name: "Bilgewater's Grotto",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isBilgewatersGrottoMap,
  createBranch(controller) {
    return new BilgewatersGrottoBranch(controller);
  },
};
