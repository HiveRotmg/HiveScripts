import { SpriteWorldBranch } from './SpriteWorldBranch.mjs';
import { isSpriteWorldMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "sprite-world",
  name: "Sprite World",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSpriteWorldMap,
  createBranch(controller) {
    return new SpriteWorldBranch(controller);
  },
};
