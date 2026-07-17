import { TheTavernBranch } from './TheTavernBranch.mjs';
import { isTheTavernMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-tavern",
  name: "The Tavern",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheTavernMap,
  createBranch(controller) {
    return new TheTavernBranch(controller);
  },
};
