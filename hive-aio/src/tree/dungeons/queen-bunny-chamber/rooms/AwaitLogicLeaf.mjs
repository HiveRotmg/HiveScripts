import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

/**
 * Fallback while Queen Bunny Chamber room logic is unfinished.
 * Keeps the dungeon branch valid so OtherMap does not steal the map.
 */
export class AwaitLogicLeaf extends Leaf {
  constructor(controller) {
    super("Await Queen Bunny Chamber Logic");
    this.controller = controller;
  }

  isValid() {
    return true;
  }

  onLoop() {
    this.controller.appendActivity?.("Dungeon: in Queen Bunny Chamber (solver pending)");
    return TIMING.placeholderPollMs;
  }
}
