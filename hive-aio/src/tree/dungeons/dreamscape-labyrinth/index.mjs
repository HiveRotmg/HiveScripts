import { DreamscapeLabyrinthBranch } from './DreamscapeLabyrinthBranch.mjs';
import { isDreamscapeLabyrinthMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "dreamscape-labyrinth",
  name: "Dreamscape Labyrinth",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isDreamscapeLabyrinthMap,
  createBranch(controller) {
    return new DreamscapeLabyrinthBranch(controller);
  },
};
