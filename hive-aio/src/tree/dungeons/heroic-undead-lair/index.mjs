import { HeroicUndeadLairBranch } from './HeroicUndeadLairBranch.mjs';
import { isHeroicUndeadLairMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "heroic-undead-lair",
  name: "Heroic Undead Lair",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isHeroicUndeadLairMap,
  createBranch(controller) {
    return new HeroicUndeadLairBranch(controller);
  },
};
