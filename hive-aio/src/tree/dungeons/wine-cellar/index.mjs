import { WineCellarBranch } from './WineCellarBranch.mjs';
import { isWineCellarMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "wine-cellar",
  name: "Wine Cellar",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isWineCellarMap,
  createBranch(controller) {
    return new WineCellarBranch(controller);
  },
};
