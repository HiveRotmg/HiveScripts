import { CaveOfAThousandTreasuresBranch } from './CaveOfAThousandTreasuresBranch.mjs';
import { isCaveOfAThousandTreasuresMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "cave-of-a-thousand-treasures",
  name: "Cave of A Thousand Treasures",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isCaveOfAThousandTreasuresMap,
  createBranch(controller) {
    return new CaveOfAThousandTreasuresBranch(controller);
  },
};
