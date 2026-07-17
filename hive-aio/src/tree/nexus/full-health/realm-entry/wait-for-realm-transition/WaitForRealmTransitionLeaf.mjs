import { Hive, Leaf } from '@hive/sdk';
import { LIMITS, TIMING } from '../../../../../config/constants.mjs?rev=portal-settle-20260714';
import { stopMoving } from '../../../../../sdk/compat.mjs';

function distanceSquared(from, to) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  return deltaX * deltaX + deltaY * deltaY;
}

export class WaitForRealmTransitionLeaf extends Leaf {
  constructor(controller, progress) {
    super('Wait For Realm Transition');
    this.controller = controller;
    this.progress = progress;
  }

  isValid() {
    return true;
  }

  onLoop() {
    if (!Hive.world.isNexus()) return TIMING.nexusPollMs;

    const now = Date.now();
    const portal = Hive.world.getRealmPortals()
      .find((candidate) => candidate.objectId === this.progress.portalTargetId);
    const unavailable = !portal
      || (portal.maxPlayers > 0 && portal.players >= portal.maxPlayers);

    if (unavailable) {
      this.progress.resetPortalAttempt();
      return 0;
    }

    const timedOut = now - this.progress.portalAttemptStartedAt >= TIMING.portalTransitionTimeoutMs;
    const attemptsExhausted = this.progress.portalUseAttempts >= LIMITS.maxPortalUseAttempts;
    if (timedOut || attemptsExhausted) {
      this.progress.cooldownCurrentPortal(now, TIMING.portalFailureCooldownMs);
      this.progress.resetPortalAttempt();
      return 0;
    }

    if (now - this.progress.lastPortalUseAt < TIMING.portalUseRetryMs) {
      return TIMING.nexusPollMs;
    }

    const position = Hive.self.getPosition();
    if (distanceSquared(position, portal) > LIMITS.portalUseTolerance ** 2) {
      this.progress.resetPortalAttempt();
      return 0;
    }

    stopMoving();
    if (this.progress.portalInRangeSince === null) {
      this.progress.portalInRangeSince = now;
      return TIMING.nexusPollMs;
    }
    if (now - this.progress.portalInRangeSince < TIMING.portalSettleMs) {
      return Math.min(
        TIMING.nexusPollMs,
        TIMING.portalSettleMs - (now - this.progress.portalInRangeSince),
      );
    }

    if (!Hive.walking.enterPortal(portal.objectId)) {
      this.progress.resetPortalAttempt();
      return 0;
    }

    this.progress.lastPortalUseAt = now;
    this.progress.portalUseAttempts += 1;
    return TIMING.nexusPollMs;
  }
}
