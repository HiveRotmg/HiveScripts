import { DeadwaterDocksBranch } from './DeadwaterDocksBranch.mjs';
import { isDeadwaterDocksMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "deadwater-docks",
  name: "Deadwater Docks",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isDeadwaterDocksMap,
  createBranch(controller) {
    return new DeadwaterDocksBranch(controller);
  },
};
