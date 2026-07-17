import { OryxsSanctuaryBranch } from './OryxsSanctuaryBranch.mjs';
import { isOryxsSanctuaryMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "oryxs-sanctuary",
  name: "Oryx's Sanctuary",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isOryxsSanctuaryMap,
  createBranch(controller) {
    return new OryxsSanctuaryBranch(controller);
  },
};
