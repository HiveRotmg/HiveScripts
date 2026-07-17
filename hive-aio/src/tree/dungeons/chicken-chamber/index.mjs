import { ChickenChamberBranch } from './ChickenChamberBranch.mjs';
import { isChickenChamberMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "chicken-chamber",
  name: "Chicken Chamber",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isChickenChamberMap,
  createBranch(controller) {
    return new ChickenChamberBranch(controller);
  },
};
