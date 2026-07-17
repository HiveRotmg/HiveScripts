import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

/**
 * Fallback while Moonlight Village room logic is unfinished.
 * Keeps the dungeon branch valid so OtherMap does not steal the map.
 */
export class AwaitLogicLeaf extends Leaf {
  constructor(controller) {
    super("Await Moonlight Village Logic");
    this.controller = controller;
  }

  isValid() {
    return true;
  }

  onLoop() {
    this.controller.appendActivity?.("Dungeon: in Moonlight Village (solver pending)");
    return TIMING.placeholderPollMs;
  }
}
