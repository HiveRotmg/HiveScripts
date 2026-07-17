import { TheCrawlingDepthsBranch } from './TheCrawlingDepthsBranch.mjs';
import { isTheCrawlingDepthsMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "the-crawling-depths",
  name: "The Crawling Depths",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isTheCrawlingDepthsMap,
  createBranch(controller) {
    return new TheCrawlingDepthsBranch(controller);
  },
};
