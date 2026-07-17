import { SnakePitBranch } from './SnakePitBranch.mjs';
import { isSnakePitMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "snake-pit",
  name: "Snake Pit",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSnakePitMap,
  createBranch(controller) {
    return new SnakePitBranch(controller);
  },
};
