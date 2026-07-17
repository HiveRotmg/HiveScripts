import { CourtOfOryxBranch } from './CourtOfOryxBranch.mjs';
import { isCourtOfOryxMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "court-of-oryx",
  name: "Court of Oryx",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCourtOfOryxMap,
  createBranch(controller) {
    return new CourtOfOryxBranch(controller);
  },
};
