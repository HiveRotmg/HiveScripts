export class RealmEntryProgress {
  waypointStarted = false;
  waypointBypassed = false;
  waypointRetryCount = 0;
  lastWaypointCommandAt = 0;
  portalEntryStarted = false;
  portalTargetId = null;
  portalAttemptStartedAt = 0;
  lastPortalApproachAt = 0;
  lastPortalUseAt = 0;
  portalUseAttempts = 0;
  portalCooldowns = new Map();

  reset() {
    this.waypointStarted = false;
    this.waypointBypassed = false;
    this.waypointRetryCount = 0;
    this.lastWaypointCommandAt = 0;
    this.portalCooldowns.clear();
    this.resetPortalAttempt();
  }

  resetPortalAttempt() {
    this.portalEntryStarted = false;
    this.portalTargetId = null;
    this.portalAttemptStartedAt = 0;
    this.lastPortalApproachAt = 0;
    this.lastPortalUseAt = 0;
    this.portalUseAttempts = 0;
  }

  cooldownCurrentPortal(now, cooldownMs) {
    if (this.portalTargetId !== null) {
      this.portalCooldowns.set(this.portalTargetId, now + cooldownMs);
    }
  }
}
