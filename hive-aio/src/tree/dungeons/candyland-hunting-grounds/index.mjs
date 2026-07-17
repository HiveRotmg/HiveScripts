import { CandylandHuntingGroundsBranch } from './CandylandHuntingGroundsBranch.mjs';
import { isCandylandHuntingGroundsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "candyland-hunting-grounds",
  name: "Candyland Hunting Grounds",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCandylandHuntingGroundsMap,
  createBranch(controller) {
    return new CandylandHuntingGroundsBranch(controller);
  },
};
