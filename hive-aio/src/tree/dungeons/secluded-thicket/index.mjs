import { SecludedThicketBranch } from './SecludedThicketBranch.mjs';
import { isSecludedThicketMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "secluded-thicket",
  name: "Secluded Thicket",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSecludedThicketMap,
  createBranch(controller) {
    return new SecludedThicketBranch(controller);
  },
};
