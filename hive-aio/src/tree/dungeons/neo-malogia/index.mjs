import { NeoMalogiaBranch } from './NeoMalogiaBranch.mjs';
import { isNeoMalogiaMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "neo-malogia",
  name: "Neo Malogia",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isNeoMalogiaMap,
  createBranch(controller) {
    return new NeoMalogiaBranch(controller);
  },
};
