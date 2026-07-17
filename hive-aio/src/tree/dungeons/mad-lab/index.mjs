import { MadLabBranch } from './MadLabBranch.mjs';
import { isMadLabMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "mad-lab",
  name: "Mad Lab",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isMadLabMap,
  createBranch(controller) {
    return new MadLabBranch(controller);
  },
};
