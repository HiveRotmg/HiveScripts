import { DavyJonesLockerBranch } from './DavyJonesLockerBranch.mjs';
import { isDavyJonesLockerMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "davy-jones-locker",
  name: "Davy Jones' Locker",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isDavyJonesLockerMap,
  createBranch(controller) {
    return new DavyJonesLockerBranch(controller);
  },
};
