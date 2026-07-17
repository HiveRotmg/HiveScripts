import { TheVoidBranch } from './TheVoidBranch.mjs';
import { isTheVoidMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-void",
  name: "The Void",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheVoidMap,
  createBranch(controller) {
    return new TheVoidBranch(controller);
  },
};
