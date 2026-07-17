import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../config/constants.mjs';
import { pathfindingWalkTo } from '../../../movement/pathfinding.mjs?rev=combined-navigation-20260714';
import { callOptional, stopMoving } from '../../../sdk/compat.mjs';
import {
  EVIL_CHICKEN_GOD_TYPE,
  EXALTED_KITCHEN_PORTAL_TYPE,
  TUTORIAL_ARRIVAL_TOLERANCE,
  TUTORIAL_PORTAL_RETRY_MS,
  TUTORIAL_PORTAL_TOLERANCE,
  TUTORIAL_POST_BOSS_WAYPOINTS,
  TUTORIAL_WAYPOINTS,
} from '../tutorial-route.mjs?rev=tutorial-fresh-account-20260717';

/**
 * Completes the fresh-account tutorial map, then enters Exalted Kitchen.
 * After leaving tutorial, normal AIO branches take over.
 */
export class CompleteTutorialLeaf extends Leaf {
  constructor(controller) {
    super('Complete Tutorial');
    this.controller = controller;
    this.reset();
  }

  isValid() {
    return true;
  }

  onLoop() {
    if (this.phase === 'wait') return this.stepWait();
    if (this.phase === 'kill-chicken-god') return this.stepKillChickenGod();
    if (this.phase === 'enter-kitchen') return this.stepEnterKitchen();
    return this.stepPathfind();
  }

  reset() {
    this.phase = 'pathfind';
    this.waypointIndex = 0;
    this.postBossIndex = 0;
    this.activeWaypoints = TUTORIAL_WAYPOINTS;
    this.waitUntil = 0;
    this.lastPortalAt = 0;
    this.seenChickenGod = false;
  }

  stepPathfind() {
    const index = this.activeWaypoints === TUTORIAL_POST_BOSS_WAYPOINTS
      ? this.postBossIndex
      : this.waypointIndex;
    const target = this.activeWaypoints[index];
    if (!target) return this.onWaypointsExhausted();

    if (Hive.walking.hasReached(target, TUTORIAL_ARRIVAL_TOLERANCE)) {
      if (target.enableAutoAim) this.ensureAutoAim();
      if (target.waitMs) {
        stopMoving();
        this.waitUntil = Date.now() + target.waitMs;
        this.phase = 'wait';
        this.controller.appendActivity?.(
          `Tutorial: waiting ${(target.waitMs / 1000).toFixed(1)}s`,
        );
        return TIMING.nexusPollMs;
      }
      return this.advanceWaypoint();
    }

    this.ensureAutoAim();
    pathfindingWalkTo(
      this.controller,
      target.x,
      target.y,
      TUTORIAL_ARRIVAL_TOLERANCE,
    );
    this.controller.appendActivity?.(
      `Tutorial: pathfinding to ${target.x},${target.y}`,
    );
    return TIMING.nexusPollMs;
  }

  stepWait() {
    this.ensureAutoAim();
    const remaining = this.waitUntil - Date.now();
    if (remaining > 0) {
      return Math.min(TIMING.nexusPollMs, remaining);
    }
    return this.advanceWaypoint();
  }

  stepKillChickenGod() {
    stopMoving();

    const bosses = Hive.enemies.getByType(EVIL_CHICKEN_GOD_TYPE);
    if (bosses.length > 0) {
      this.seenChickenGod = true;
      callOptional(Hive.combat, 'aimAt', bosses[0].objectId);
      this.controller.appendActivity?.('Tutorial: killing Evil Chicken God');
      return TIMING.nexusPollMs;
    }

    if (!this.seenChickenGod) {
      this.ensureAutoAim();
      this.controller.appendActivity?.('Tutorial: waiting for Evil Chicken God');
      return TIMING.nexusPollMs;
    }

    this.ensureAutoAim();
    this.phase = 'pathfind';
    this.postBossIndex = 0;
    this.activeWaypoints = TUTORIAL_POST_BOSS_WAYPOINTS;
    this.controller.appendActivity?.('Tutorial: Chicken God dead, continuing');
    return this.stepPathfind();
  }

  stepEnterKitchen() {
    const portal = this.findKitchenPortal();
    if (!portal) {
      this.controller.appendActivity?.('Tutorial: waiting for Exalted Kitchen portal');
      return TIMING.nexusPollMs;
    }

    const pos = portal.position ?? portal;
    const target = { x: pos.x, y: pos.y };
    if (!Hive.walking.hasReached(target, TUTORIAL_PORTAL_TOLERANCE)) {
      pathfindingWalkTo(
        this.controller,
        target.x,
        target.y,
        TUTORIAL_PORTAL_TOLERANCE,
      );
      this.controller.appendActivity?.('Tutorial: walking to Exalted Kitchen');
      return TIMING.nexusPollMs;
    }

    stopMoving();
    const now = Date.now();
    if (now - this.lastPortalAt >= TUTORIAL_PORTAL_RETRY_MS) {
      this.lastPortalAt = now;
      callOptional(Hive.walking, 'enterPortal', portal.objectId);
    }
    this.controller.appendActivity?.('Tutorial: entering Exalted Kitchen');
    return TIMING.nexusPollMs;
  }

  advanceWaypoint() {
    if (this.activeWaypoints === TUTORIAL_POST_BOSS_WAYPOINTS) {
      this.postBossIndex += 1;
      if (this.postBossIndex >= TUTORIAL_POST_BOSS_WAYPOINTS.length) {
        this.phase = 'enter-kitchen';
        stopMoving();
        return this.stepEnterKitchen();
      }
      this.phase = 'pathfind';
      return this.stepPathfind();
    }

    this.waypointIndex += 1;
    if (this.waypointIndex >= TUTORIAL_WAYPOINTS.length) {
      this.phase = 'kill-chicken-god';
      stopMoving();
      return this.stepKillChickenGod();
    }
    this.phase = 'pathfind';
    this.activeWaypoints = TUTORIAL_WAYPOINTS;
    return this.stepPathfind();
  }

  onWaypointsExhausted() {
    if (this.activeWaypoints === TUTORIAL_POST_BOSS_WAYPOINTS) {
      this.phase = 'enter-kitchen';
      return this.stepEnterKitchen();
    }
    this.phase = 'kill-chicken-god';
    return this.stepKillChickenGod();
  }

  findKitchenPortal() {
    const byType = Hive.world.objects.getByType?.(EXALTED_KITCHEN_PORTAL_TYPE) ?? [];
    if (byType.length > 0) return byType[0];

    const portals = Hive.world.objects.getPortals?.() ?? [];
    return portals.find((portal) => {
      const type = portal.objectType ?? portal.type;
      const name = String(portal.name ?? '').toLowerCase();
      return type === EXALTED_KITCHEN_PORTAL_TYPE || name.includes('exalted kitchen');
    }) ?? null;
  }

  ensureAutoAim() {
    callOptional(Hive.combat, 'enableAutoAim', {
      mode: 'closest',
      bossPriority: false,
    });
  }
}
