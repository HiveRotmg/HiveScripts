import { KitchenBranch } from './KitchenBranch.mjs';
import { isKitchenMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "kitchen",
  name: "Kitchen",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isKitchenMap,
  createBranch(controller) {
    return new KitchenBranch(controller);
  },
};
