import { Hive, Leaf } from '@hive/sdk';
import {
  LIMITS,
  NEXUS_HEALING_WAYPOINT,
  TIMING,
} from '../../../../config/constants.mjs?rev=nexus-healers-20260714';

export class WalkToNexusHealersLeaf extends Leaf {
  constructor(controller) {
    super('Walk To Nexus Healers');
    this.controller = controller;
  }

  isValid() {
    return this.controller.state.vault === false;
  }

  onLoop() {
    if (!Hive.walking.hasReached(NEXUS_HEALING_WAYPOINT, LIMITS.waypointTolerance)) {
      Hive.walking.pathfindingWalkTo(NEXUS_HEALING_WAYPOINT.x, NEXUS_HEALING_WAYPOINT.y);
    }
    return TIMING.placeholderPollMs;
  }
}
