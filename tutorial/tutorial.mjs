import { Hive } from '@hive/sdk';

const WAIT_MS = 1000;
const EVIL_CHICKEN_GOD_TYPE = 0x6b1; // 1713
const EXALTED_KITCHEN_PORTAL_TYPE = 635; // 0x27B

const WAYPOINTS = [
  { x: 120, y: 220 },
  { x: 128, y: 94, waitMs: WAIT_MS, enableAutoAim: true },
  { x: 128, y: 71, waitMs: WAIT_MS },
  { x: 128, y: 61 },
];

const POST_BOSS_WAYPOINTS = [
  { x: 128, y: 45, waitMs: WAIT_MS },
  { x: 128, y: 33, waitMs: WAIT_MS },
  { x: 128, y: 29 },
];

const ARRIVAL_TOLERANCE = 0.5;
const PORTAL_TOLERANCE = 1.0;
const LOOP_DELAY_MS = 200;
const NEXUS_RETRY_MS = 3000;
const TUTORIAL_RETRY_MS = 4000;
const PORTAL_RETRY_MS = 1500;

/**
 * Phases:
 * 1. Reach the nexus
 * 2. Send /tutorial (skipped when tutorialComplete)
 * 3. Pathfind through tutorial rooms
 * 4. Kill Evil Chicken God
 * 5. Pathfind to Exalted Kitchen portal, enter it
 * 6. On new map, nexus and set tutorialComplete = true
 */
export default class Tutorial {
  phase = 'to-nexus';
  waypointIndex = 0;
  postBossIndex = 0;
  activeWaypoints = WAYPOINTS;
  lastNexusAt = 0;
  lastTutorialAt = 0;
  lastPortalAt = 0;
  waitUntil = 0;
  autoAimEnabled = false;
  tutorialCommandSent = false;
  seenChickenGod = false;
  portalEntryStarted = false;
  tutorialComplete = false;

  onStart() {
    this.phase = this.tutorialComplete
      ? 'done'
      : this.isInTutorial()
        ? 'pathfind'
        : 'to-nexus';
    this.waypointIndex = 0;
    this.postBossIndex = 0;
    this.activeWaypoints = WAYPOINTS;
    this.lastNexusAt = 0;
    this.lastTutorialAt = 0;
    this.lastPortalAt = 0;
    this.waitUntil = 0;
    this.autoAimEnabled = false;
    this.tutorialCommandSent = false;
    this.seenChickenGod = false;
    this.portalEntryStarted = false;
    Hive.ui.status(this.tutorialComplete ? 'Tutorial: complete' : 'Tutorial: starting');
  }

  onLoop() {
    if (this.phase === 'done') {
      Hive.ui.status(this.tutorialComplete ? 'Tutorial: complete' : 'Tutorial: at target');
      return 1000;
    }

    if (!Hive.connection.isConnected() || !Hive.connection.isInWorld()) {
      Hive.ui.status('Tutorial: waiting for world');
      return LOOP_DELAY_MS;
    }

    if (this.phase === 'to-nexus') {
      return this.stepToNexus();
    }
    if (this.phase === 'enter-tutorial') {
      return this.stepEnterTutorial();
    }
    if (this.phase === 'wait') {
      return this.stepWait();
    }
    if (this.phase === 'pathfind' || this.phase === 'post-boss') {
      return this.stepPathfind();
    }
    if (this.phase === 'kill-chicken-god') {
      return this.stepKillChickenGod();
    }
    if (this.phase === 'enter-kitchen') {
      return this.stepEnterKitchen();
    }
    if (this.phase === 'return-nexus') {
      return this.stepReturnNexus();
    }

    Hive.ui.status('Tutorial: at target');
    return 1000;
  }

  onStop() {
    Hive.combat.disableAutoAim();
    Hive.walking.stopMoving();
    Hive.ui.status(null);
  }

  stepToNexus() {
    if (this.tutorialComplete) {
      this.phase = 'done';
      Hive.ui.status('Tutorial: complete');
      return 1000;
    }

    if (this.isInTutorial()) {
      this.phase = 'pathfind';
      this.activeWaypoints = WAYPOINTS;
      return this.stepPathfind();
    }

    if (Hive.world.isNexus()) {
      this.phase = 'enter-tutorial';
      this.tutorialCommandSent = false;
      return this.stepEnterTutorial();
    }

    const now = Date.now();
    if (now - this.lastNexusAt >= NEXUS_RETRY_MS) {
      this.lastNexusAt = now;
      Hive.walking.nexus();
    }
    Hive.ui.status('Tutorial: connecting to nexus');
    return LOOP_DELAY_MS;
  }

  stepEnterTutorial() {
    if (this.tutorialComplete) {
      this.phase = 'done';
      Hive.ui.status('Tutorial: complete');
      return 1000;
    }

    if (this.isInTutorial() || (this.tutorialCommandSent && !Hive.world.isNexus())) {
      this.phase = 'pathfind';
      this.waypointIndex = 0;
      this.activeWaypoints = WAYPOINTS;
      return this.stepPathfind();
    }

    const now = Date.now();
    if (!this.tutorialCommandSent || now - this.lastTutorialAt >= TUTORIAL_RETRY_MS) {
      this.lastTutorialAt = now;
      this.tutorialCommandSent = true;
      Hive.chat.say('/tutorial');
    }
    Hive.ui.status('Tutorial: sending /tutorial');
    return LOOP_DELAY_MS;
  }

  stepPathfind() {
    const index = this.phase === 'post-boss' ? this.postBossIndex : this.waypointIndex;
    const target = this.activeWaypoints[index];
    if (!target) {
      return this.onWaypointsExhausted();
    }

    if (Hive.walking.hasReached(target, ARRIVAL_TOLERANCE)) {
      if (target.enableAutoAim) {
        this.ensureAutoAim();
      }
      if (target.waitMs) {
        Hive.walking.stopMoving();
        this.waitUntil = Date.now() + target.waitMs;
        this.phase = 'wait';
        Hive.ui.status(`Tutorial: waiting ${(target.waitMs / 1000).toFixed(1)}s`);
        return LOOP_DELAY_MS;
      }
      return this.advanceWaypoint();
    }

    this.ensureAutoAim();
    Hive.walking.pathfindingWalkTo(target.x, target.y, ARRIVAL_TOLERANCE);
    Hive.ui.status(`Tutorial: pathfinding to ${target.x},${target.y}`);
    return LOOP_DELAY_MS;
  }

  stepWait() {
    this.ensureAutoAim();
    const remaining = this.waitUntil - Date.now();
    if (remaining > 0) {
      Hive.ui.status(`Tutorial: waiting (${(remaining / 1000).toFixed(1)}s)`);
      return Math.min(LOOP_DELAY_MS, remaining);
    }
    return this.advanceWaypoint();
  }

  stepKillChickenGod() {
    Hive.walking.stopMoving();

    const bosses = Hive.enemies.getByType(EVIL_CHICKEN_GOD_TYPE);
    if (bosses.length > 0) {
      this.seenChickenGod = true;
      Hive.combat.aimAt(bosses[0].objectId);
      this.autoAimEnabled = false;
      Hive.ui.status('Tutorial: killing Evil Chicken God');
      return LOOP_DELAY_MS;
    }

    if (!this.seenChickenGod) {
      this.ensureAutoAim();
      Hive.ui.status('Tutorial: waiting for Evil Chicken God');
      return LOOP_DELAY_MS;
    }

    this.ensureAutoAim();
    this.phase = 'post-boss';
    this.postBossIndex = 0;
    this.activeWaypoints = POST_BOSS_WAYPOINTS;
    Hive.ui.status('Tutorial: Chicken God dead, continuing');
    return this.stepPathfind();
  }

  stepEnterKitchen() {
    // Left the tutorial map after using the portal.
    if (this.portalEntryStarted && !this.isInTutorial()) {
      this.phase = 'return-nexus';
      this.lastNexusAt = 0;
      Hive.ui.status('Tutorial: kitchen reached, returning to nexus');
      return this.stepReturnNexus();
    }

    const portal = this.findKitchenPortal();
    if (!portal) {
      Hive.ui.status('Tutorial: waiting for Exalted Kitchen portal');
      return LOOP_DELAY_MS;
    }

    const pos = portal.position ?? portal;
    const target = { x: pos.x, y: pos.y };
    if (!Hive.walking.hasReached(target, PORTAL_TOLERANCE)) {
      Hive.walking.pathfindingWalkTo(target.x, target.y, PORTAL_TOLERANCE);
      Hive.ui.status('Tutorial: walking to Exalted Kitchen');
      return LOOP_DELAY_MS;
    }

    Hive.walking.stopMoving();
    const now = Date.now();
    if (now - this.lastPortalAt >= PORTAL_RETRY_MS) {
      this.lastPortalAt = now;
      if (Hive.walking.enterPortal(portal.objectId)) {
        this.portalEntryStarted = true;
      }
    }
    Hive.ui.status('Tutorial: entering Exalted Kitchen');
    return LOOP_DELAY_MS;
  }

  stepReturnNexus() {
    if (Hive.world.isNexus()) {
      this.tutorialComplete = true;
      this.phase = 'done';
      Hive.walking.stopMoving();
      Hive.ui.status('Tutorial: complete');
      return 1000;
    }

    const now = Date.now();
    if (now - this.lastNexusAt >= NEXUS_RETRY_MS) {
      this.lastNexusAt = now;
      Hive.walking.nexus();
    }
    Hive.ui.status('Tutorial: returning to nexus');
    return LOOP_DELAY_MS;
  }

  advanceWaypoint() {
    if (this.activeWaypoints === POST_BOSS_WAYPOINTS || this.phase === 'post-boss') {
      this.postBossIndex += 1;
      if (this.postBossIndex >= POST_BOSS_WAYPOINTS.length) {
        this.phase = 'enter-kitchen';
        Hive.walking.stopMoving();
        return this.stepEnterKitchen();
      }
      this.phase = 'post-boss';
      this.activeWaypoints = POST_BOSS_WAYPOINTS;
      return this.stepPathfind();
    }

    this.waypointIndex += 1;
    if (this.waypointIndex >= WAYPOINTS.length) {
      this.phase = 'kill-chicken-god';
      Hive.walking.stopMoving();
      return this.stepKillChickenGod();
    }
    this.phase = 'pathfind';
    this.activeWaypoints = WAYPOINTS;
    return this.stepPathfind();
  }

  onWaypointsExhausted() {
    if (this.activeWaypoints === POST_BOSS_WAYPOINTS) {
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
    Hive.combat.enableAutoAim();
    this.autoAimEnabled = true;
  }

  isInTutorial() {
    const name = String(Hive.world.getName?.() ?? '').toLowerCase();
    return name.includes('tutorial');
  }
}
