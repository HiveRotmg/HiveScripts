import { Hive, Leaf } from '@hive/sdk';
import { LIMITS, NEXUS_PORTAL_WAYPOINT, TIMING } from '../../../../../config/constants.mjs';
import { pathfindingWalkTo } from '../../../../../movement/pathfinding.mjs?rev=combined-navigation-20260714';

export class WalkToPortalWaypointLeaf extends Leaf {
  constructor(controller, progress) {
    super('Walk To Nexus Portal Waypoint');
    this.controller = controller;
    this.progress = progress;
  }

  isValid() {
    if (this.progress.waypointCompleted || this.progress.waypointBypassed) return false;
    if (Hive.walking.hasReached(NEXUS_PORTAL_WAYPOINT, LIMITS.waypointTolerance)) {
      this.progress.waypointCompleted = true;
      return false;
    }
    return true;
  }

  onLoop() {
    const now = Date.now();

    if (!this.progress.waypointStarted) {
      this.progress.waypointStarted = true;
      this.progress.lastWaypointCommandAt = now;
      pathfindingWalkTo(
        this.controller,
        NEXUS_PORTAL_WAYPOINT.x,
        NEXUS_PORTAL_WAYPOINT.y,
      );
      return TIMING.nexusPollMs;
    }

    if (now - this.progress.lastWaypointCommandAt < TIMING.waypointRetryMs) {
      return TIMING.nexusPollMs;
    }

    this.progress.waypointRetryCount += 1;
    if (this.progress.waypointRetryCount >= LIMITS.maxWaypointRetries) {
      this.progress.waypointBypassed = true;
      Hive.log.warn('Nexus waypoint remained unreachable; routing directly to an open Realm portal.');
      return 0;
    }

    this.progress.lastWaypointCommandAt = now;
    pathfindingWalkTo(
      this.controller,
      NEXUS_PORTAL_WAYPOINT.x,
      NEXUS_PORTAL_WAYPOINT.y,
    );
    return TIMING.nexusPollMs;
  }
}
