import { WoodlandLabyrinthBranch } from './WoodlandLabyrinthBranch.mjs';
import { isWoodlandLabyrinthMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "woodland-labyrinth",
  name: "Woodland Labyrinth",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isWoodlandLabyrinthMap,
  createBranch(controller) {
    return new WoodlandLabyrinthBranch(controller);
  },
};
