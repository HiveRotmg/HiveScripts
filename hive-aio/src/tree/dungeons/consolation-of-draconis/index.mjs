import { ConsolationOfDraconisBranch } from './ConsolationOfDraconisBranch.mjs';
import { isConsolationOfDraconisMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "consolation-of-draconis",
  name: "Consolation of Draconis",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isConsolationOfDraconisMap,
  createBranch(controller) {
    return new ConsolationOfDraconisBranch(controller);
  },
};
