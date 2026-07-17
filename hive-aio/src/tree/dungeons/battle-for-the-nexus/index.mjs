import { BattleForTheNexusBranch } from './BattleForTheNexusBranch.mjs';
import { isBattleForTheNexusMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "battle-for-the-nexus",
  name: "Battle for the Nexus",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isBattleForTheNexusMap,
  createBranch(controller) {
    return new BattleForTheNexusBranch(controller);
  },
};
