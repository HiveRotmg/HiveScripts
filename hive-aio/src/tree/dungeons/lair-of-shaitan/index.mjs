import { LairOfShaitanBranch } from './LairOfShaitanBranch.mjs';
import { isLairOfShaitanMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "lair-of-shaitan",
  name: "Lair of Shaitan",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isLairOfShaitanMap,
  createBranch(controller) {
    return new LairOfShaitanBranch(controller);
  },
};
