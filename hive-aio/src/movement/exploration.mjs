import { Hive } from '@hive/sdk';
import {
  LIMITS,
  REALM_FALLBACK_CENTER,
  TIMING,
} from '../config/constants.mjs?rev=realm-exploration-20260715';
import { pathfindingWalkTo } from './pathfinding.mjs?rev=realm-exploration-20260715';

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function getRealmCenter() {
  let dimensions;
  try {
    dimensions = Hive.world.getDimensions?.();
  } catch {
    dimensions = null;
  }
  const width = finitePositive(dimensions?.width);
  const height = finitePositive(dimensions?.height);
  if (!width || !height) return REALM_FALLBACK_CENTER;
  return { x: width / 2, y: height / 2 };
}

export function walkTowardRealmCenter(controller) {
  const center = getRealmCenter();
  return pathfindingWalkTo(
    controller,
    center.x,
    center.y,
    LIMITS.realmCenterArrivalTolerance,
  );
}

function anchorKey(anchor) {
  return `${anchor?.objectId ?? ''}:${anchor?.position?.x ?? ''}:${anchor?.position?.y ?? ''}`;
}

export class CircularBeaconExplorer {
  constructor(controller, radius) {
    this.controller = controller;
    this.radius = radius;
    this.key = null;
    this.waypointIndex = 0;
    this.target = null;
    this.targetStartedAt = 0;
  }

  reset() {
    this.key = null;
    this.waypointIndex = 0;
    this.target = null;
    this.targetStartedAt = 0;
  }

  pause() {
    this.targetStartedAt = 0;
  }

  walk(anchor) {
    if (!anchor?.position) return false;

    const nextKey = anchorKey(anchor);
    if (nextKey !== this.key) {
      this.reset();
      this.key = nextKey;
    }

    const now = Date.now();
    if (!this.target) this.selectTarget(anchor, now);
    const reached = Hive.walking.hasReached(
      this.target,
      LIMITS.explorationArrivalTolerance,
    );
    const timedOut = this.targetStartedAt > 0
      && now - this.targetStartedAt >= TIMING.explorationWaypointTimeoutMs;
    if (reached || timedOut) {
      this.waypointIndex = (this.waypointIndex + 1) % LIMITS.explorationWaypointCount;
      this.selectTarget(anchor, now);
    } else if (this.targetStartedAt === 0) {
      this.targetStartedAt = now;
    }

    return pathfindingWalkTo(
      this.controller,
      this.target.x,
      this.target.y,
      LIMITS.explorationArrivalTolerance,
    );
  }

  selectTarget(anchor, now) {
    const angle = this.waypointIndex * Math.PI * 2 / LIMITS.explorationWaypointCount;
    this.target = {
      x: anchor.position.x + Math.cos(angle) * this.radius,
      y: anchor.position.y + Math.sin(angle) * this.radius,
    };
    this.targetStartedAt = now;
  }
}
