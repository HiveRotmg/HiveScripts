import { AdvancedKogboldSteamworksBranch } from './AdvancedKogboldSteamworksBranch.mjs';
import { isAdvancedKogboldSteamworksMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "advanced-kogbold-steamworks",
  name: "Advanced Kogbold Steamworks",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isAdvancedKogboldSteamworksMap,
  createBranch(controller) {
    return new AdvancedKogboldSteamworksBranch(controller);
  },
};
