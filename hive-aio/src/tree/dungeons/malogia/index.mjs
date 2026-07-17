import { MalogiaBranch } from './MalogiaBranch.mjs';
import { isMalogiaMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "malogia",
  name: "Malogia",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isMalogiaMap,
  createBranch(controller) {
    return new MalogiaBranch(controller);
  },
};
