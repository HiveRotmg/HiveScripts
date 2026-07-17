import { NeoForaxBranch } from './NeoForaxBranch.mjs';
import { isNeoForaxMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "neo-forax",
  name: "Neo Forax",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isNeoForaxMap,
  createBranch(controller) {
    return new NeoForaxBranch(controller);
  },
};
