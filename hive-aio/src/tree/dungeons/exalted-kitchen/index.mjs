import { ExaltedKitchenBranch } from './ExaltedKitchenBranch.mjs';
import { isExaltedKitchenMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "exalted-kitchen",
  name: "Exalted Kitchen",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isExaltedKitchenMap,
  createBranch(controller) {
    return new ExaltedKitchenBranch(controller);
  },
};
