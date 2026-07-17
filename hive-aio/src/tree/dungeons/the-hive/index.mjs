import { TheHiveBranch } from './TheHiveBranch.mjs';
import { isTheHiveMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-hive",
  name: "The Hive",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheHiveMap,
  createBranch(controller) {
    return new TheHiveBranch(controller);
  },
};
