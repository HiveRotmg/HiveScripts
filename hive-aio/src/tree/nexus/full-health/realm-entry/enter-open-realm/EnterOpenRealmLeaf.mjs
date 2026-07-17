import { Hive, Leaf } from '@hive/sdk';
import { LIMITS, TIMING } from '../../../../../config/constants.mjs?rev=portal-dodge-entry-20260714';
import { pathfindingWalkTo } from '../../../../../movement/pathfinding.mjs?rev=combined-navigation-20260714';
import { stopMoving } from '../../../../../sdk/compat.mjs';

function distanceSquared(from, to) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  return deltaX * deltaX + deltaY * deltaY;
}

export class EnterOpenRealmLeaf extends Leaf {
  constructor(controller, progress) {
    super('Enter Open Realm');
    this.controller = controller;
    this.progress = progress;
  }

  isValid() {
    return !this.progress.portalEntryStarted;
  }

  onLoop() {
    const portal = this.findNearestOpenPortal();
    if (!portal) return TIMING.nexusPollMs;

    const now = Date.now();
    const position = Hive.self.getPosition();
    const inUseRange = distanceSquared(position, portal) <= LIMITS.portalUseTolerance ** 2;
    const targetChanged = this.progress.portalTargetId !== portal.objectId;

    if (!inUseRange) {
      this.progress.portalInRangeSince = null;
      const approachExpired = now - this.progress.lastPortalApproachAt >= TIMING.portalApproachRetryMs;
      if (targetChanged || approachExpired) {
        this.progress.portalTargetId = portal.objectId;
        this.progress.lastPortalApproachAt = now;
        pathfindingWalkTo(
          this.controller,
          portal.x,
          portal.y,
          LIMITS.portalApproachTolerance,
        );
      }
      return TIMING.nexusPollMs;
    }

    stopMoving();
    if (targetChanged || this.progress.portalInRangeSince === null) {
      this.progress.portalTargetId = portal.objectId;
      this.progress.portalInRangeSince = now;
      return TIMING.nexusPollMs;
    }

    if (now - this.progress.portalInRangeSince < TIMING.portalSettleMs) {
      return Math.min(
        TIMING.nexusPollMs,
        TIMING.portalSettleMs - (now - this.progress.portalInRangeSince),
      );
    }

    if (Hive.walking.enterPortal(portal.objectId)) {
      this.progress.portalEntryStarted = true;
      this.progress.portalTargetId = portal.objectId;
      this.progress.portalAttemptStartedAt = now;
      this.progress.lastPortalUseAt = now;
      this.progress.portalUseAttempts = 1;
    } else {
      this.progress.resetPortalAttempt();
    }

    return TIMING.nexusPollMs;
  }

  findNearestOpenPortal() {
    const now = Date.now();
    for (const [objectId, expiresAt] of this.progress.portalCooldowns) {
      if (expiresAt <= now) this.progress.portalCooldowns.delete(objectId);
    }

    const position = Hive.self.getPosition();
    return Hive.world.getRealmPortals()
      .filter((portal) => Number.isFinite(portal.x) && Number.isFinite(portal.y))
      .filter((portal) => portal.maxPlayers <= 0 || portal.players < portal.maxPlayers)
      .filter((portal) => !this.progress.portalCooldowns.has(portal.objectId))
      .sort((a, b) => distanceSquared(position, a) - distanceSquared(position, b))[0] ?? null;
  }
}
