import { NeoUntarisBranch } from './NeoUntarisBranch.mjs';
import { isNeoUntarisMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "neo-untaris",
  name: "Neo Untaris",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isNeoUntarisMap,
  createBranch(controller) {
    return new NeoUntarisBranch(controller);
  },
};
