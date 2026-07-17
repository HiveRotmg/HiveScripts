import { TombOfTheAncientsHeroicBranch } from './TombOfTheAncientsHeroicBranch.mjs';
import { isTombOfTheAncientsHeroicMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "tomb-of-the-ancients-heroic",
  name: "Tomb of the Ancients (Heroic)",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTombOfTheAncientsHeroicMap,
  createBranch(controller) {
    return new TombOfTheAncientsHeroicBranch(controller);
  },
};
