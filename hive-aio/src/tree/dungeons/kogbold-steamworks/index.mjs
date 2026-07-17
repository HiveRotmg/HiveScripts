import { KogboldSteamworksBranch } from './KogboldSteamworksBranch.mjs';
import { isKogboldSteamworksMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "kogbold-steamworks",
  name: "Kogbold Steamworks",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isKogboldSteamworksMap,
  createBranch(controller) {
    return new KogboldSteamworksBranch(controller);
  },
};
