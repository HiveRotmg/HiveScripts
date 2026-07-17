import { SantaWorkshopBranch } from './SantaWorkshopBranch.mjs';
import { isSantaWorkshopMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "santa-workshop",
  name: "Santa Workshop",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSantaWorkshopMap,
  createBranch(controller) {
    return new SantaWorkshopBranch(controller);
  },
};
