import { RemnantOfTheVoidBranch } from './RemnantOfTheVoidBranch.mjs';
import { isRemnantOfTheVoidMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "remnant-of-the-void",
  name: "Remnant of the Void",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isRemnantOfTheVoidMap,
  createBranch(controller) {
    return new RemnantOfTheVoidBranch(controller);
  },
};
