import { QueenBunnyChamberBranch } from './QueenBunnyChamberBranch.mjs';
import { isQueenBunnyChamberMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "queen-bunny-chamber",
  name: "Queen Bunny Chamber",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isQueenBunnyChamberMap,
  createBranch(controller) {
    return new QueenBunnyChamberBranch(controller);
  },
};
