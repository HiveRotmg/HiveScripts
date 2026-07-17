import { OryxsChamberBranch } from './OryxsChamberBranch.mjs';
import { isOryxsChamberMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "oryxs-chamber",
  name: "Oryx's Chamber",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isOryxsChamberMap,
  createBranch(controller) {
    return new OryxsChamberBranch(controller);
  },
};
