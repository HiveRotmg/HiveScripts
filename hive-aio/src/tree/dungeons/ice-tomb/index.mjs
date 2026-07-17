import { IceTombBranch } from './IceTombBranch.mjs';
import { isIceTombMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "ice-tomb",
  name: "Ice Tomb",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isIceTombMap,
  createBranch(controller) {
    return new IceTombBranch(controller);
  },
};
