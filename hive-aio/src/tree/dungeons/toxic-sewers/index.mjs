import { ToxicSewersBranch } from './ToxicSewersBranch.mjs';
import { isToxicSewersMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "toxic-sewers",
  name: "Toxic Sewers",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isToxicSewersMap,
  createBranch(controller) {
    return new ToxicSewersBranch(controller);
  },
};
