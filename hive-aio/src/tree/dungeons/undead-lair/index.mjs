import { UndeadLairBranch } from './UndeadLairBranch.mjs';
import { isUndeadLairMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "undead-lair",
  name: "Undead Lair",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isUndeadLairMap,
  createBranch(controller) {
    return new UndeadLairBranch(controller);
  },
};
