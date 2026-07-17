import { LegacyHeroicUndeadLairBranch } from './LegacyHeroicUndeadLairBranch.mjs';
import { isLegacyHeroicUndeadLairMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "legacy-heroic-undead-lair",
  name: "Legacy Heroic Undead Lair",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isLegacyHeroicUndeadLairMap,
  createBranch(controller) {
    return new LegacyHeroicUndeadLairBranch(controller);
  },
};
