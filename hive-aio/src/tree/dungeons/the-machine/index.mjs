import { TheMachineBranch } from './TheMachineBranch.mjs';
import { isTheMachineMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-machine",
  name: "The Machine",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheMachineMap,
  createBranch(controller) {
    return new TheMachineBranch(controller);
  },
};
