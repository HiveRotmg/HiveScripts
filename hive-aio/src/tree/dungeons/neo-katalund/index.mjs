import { NeoKatalundBranch } from './NeoKatalundBranch.mjs';
import { isNeoKatalundMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "neo-katalund",
  name: "Neo Katalund",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isNeoKatalundMap,
  createBranch(controller) {
    return new NeoKatalundBranch(controller);
  },
};
