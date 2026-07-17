import { MagicWoodsBranch } from './MagicWoodsBranch.mjs';
import { isMagicWoodsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "magic-woods",
  name: "Magic Woods",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isMagicWoodsMap,
  createBranch(controller) {
    return new MagicWoodsBranch(controller);
  },
};
