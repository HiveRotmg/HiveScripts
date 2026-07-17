import { AbyssOfDemonsBranch } from './AbyssOfDemonsBranch.mjs';
import { isAbyssOfDemonsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "abyss-of-demons",
  name: "Abyss of Demons",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isAbyssOfDemonsMap,
  createBranch(controller) {
    return new AbyssOfDemonsBranch(controller);
  },
};
