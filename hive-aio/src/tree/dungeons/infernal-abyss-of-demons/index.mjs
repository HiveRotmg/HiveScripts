import { InfernalAbyssOfDemonsBranch } from './InfernalAbyssOfDemonsBranch.mjs';
import { isInfernalAbyssOfDemonsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "infernal-abyss-of-demons",
  name: "Infernal Abyss of Demons",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isInfernalAbyssOfDemonsMap,
  createBranch(controller) {
    return new InfernalAbyssOfDemonsBranch(controller);
  },
};
