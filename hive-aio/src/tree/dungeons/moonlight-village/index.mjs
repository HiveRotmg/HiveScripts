import { MoonlightVillageBranch } from './MoonlightVillageBranch.mjs';
import { isMoonlightVillageMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "moonlight-village",
  name: "Moonlight Village",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isMoonlightVillageMap,
  createBranch(controller) {
    return new MoonlightVillageBranch(controller);
  },
};
