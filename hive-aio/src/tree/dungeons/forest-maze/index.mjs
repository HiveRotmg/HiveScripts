import { ForestMazeBranch } from './ForestMazeBranch.mjs';
import { isForestMazeMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "forest-maze",
  name: "Forest Maze",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isForestMazeMap,
  createBranch(controller) {
    return new ForestMazeBranch(controller);
  },
};
