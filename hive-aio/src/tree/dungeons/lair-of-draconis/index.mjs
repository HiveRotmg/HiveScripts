import { LairOfDraconisBranch } from './LairOfDraconisBranch.mjs';
import { isLairOfDraconisMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "lair-of-draconis",
  name: "Lair of Draconis",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isLairOfDraconisMap,
  createBranch(controller) {
    return new LairOfDraconisBranch(controller);
  },
};
