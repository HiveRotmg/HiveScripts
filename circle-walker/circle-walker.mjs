import { Hive } from '@hive/sdk';

const RADIUS = 3.5;
const WAYPOINT_COUNT = 16;
const ARRIVAL_TOLERANCE = 0.35;
const LOOP_DELAY_MS = 150;

export default class CircleWalker {
  center = null;
  waypoints = [];
  waypointIndex = 0;

  onStart() {
    this.center = Hive.self.getPosition();
    this.waypoints = Array.from({ length: WAYPOINT_COUNT }, (_, index) => {
      const angle = (index / WAYPOINT_COUNT) * Math.PI * 2;
      return {
        x: this.center.x + Math.cos(angle) * RADIUS,
        y: this.center.y + Math.sin(angle) * RADIUS,
      };
    });
    this.waypointIndex = 0;
    Hive.ui.status('Walking in a circle');
    this.walkToCurrentWaypoint();
  }

  onLoop() {
    const target = this.waypoints[this.waypointIndex];
    if (!target) return LOOP_DELAY_MS;

    if (Hive.walking.hasReached(target, ARRIVAL_TOLERANCE)) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      this.walkToCurrentWaypoint();
    }

    return LOOP_DELAY_MS;
  }

  onStop() {
    const position = Hive.self.getPosition();
    Hive.walking.walkTo(position.x, position.y);
    Hive.ui.status(null);
  }

  walkToCurrentWaypoint() {
    const target = this.waypoints[this.waypointIndex];
    Hive.walking.walkTo(target.x, target.y);
  }
}
