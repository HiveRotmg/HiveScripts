import { SpiderDenBranch } from './SpiderDenBranch.mjs';
import { isSpiderDenMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "spider-den",
  name: "Spider Den",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSpiderDenMap,
  createBranch(controller) {
    return new SpiderDenBranch(controller);
  },
};
