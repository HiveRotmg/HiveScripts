import { CultistHideoutBranch } from './CultistHideoutBranch.mjs';
import { isCultistHideoutMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "cultist-hideout",
  name: "Cultist Hideout",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCultistHideoutMap,
  createBranch(controller) {
    return new CultistHideoutBranch(controller);
  },
};
