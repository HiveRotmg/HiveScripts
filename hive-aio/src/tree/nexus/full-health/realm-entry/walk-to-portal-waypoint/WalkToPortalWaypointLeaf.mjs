import { Hive, Leaf } from '@hive/sdk';
import { LIMITS, NEXUS_PORTAL_WAYPOINT, TIMING } from '../../../../../config/constants.mjs';

export class WalkToPortalWaypointLeaf extends Leaf {
  constructor(controller, progress) {
    super('Walk To Nexus Portal Waypoint');
    this.controller = controller;
    this.progress = progress;
  }

  isValid() {
    return !this.progress.waypointBypassed
      && !Hive.walking.hasReached(NEXUS_PORTAL_WAYPOINT, LIMITS.waypointTolerance);
  }

  onLoop() {
    const now = Date.now();

    if (!this.progress.waypointStarted) {
      this.progress.waypointStarted = true;
      this.progress.lastWaypointCommandAt = now;
      Hive.walking.pathfindingWalkTo(NEXUS_PORTAL_WAYPOINT.x, NEXUS_PORTAL_WAYPOINT.y);
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
    Hive.walking.pathfindingWalkTo(NEXUS_PORTAL_WAYPOINT.x, NEXUS_PORTAL_WAYPOINT.y);
    return TIMING.nexusPollMs;
  }
}
