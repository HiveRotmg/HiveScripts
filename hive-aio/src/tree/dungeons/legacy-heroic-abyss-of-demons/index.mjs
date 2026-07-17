import { LegacyHeroicAbyssOfDemonsBranch } from './LegacyHeroicAbyssOfDemonsBranch.mjs';
import { isLegacyHeroicAbyssOfDemonsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "legacy-heroic-abyss-of-demons",
  name: "Legacy Heroic Abyss of Demons",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isLegacyHeroicAbyssOfDemonsMap,
  createBranch(controller) {
    return new LegacyHeroicAbyssOfDemonsBranch(controller);
  },
};
