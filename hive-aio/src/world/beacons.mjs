import { Hive } from '@hive/sdk';

function distanceSquared(from, to) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return (dx * dx) + (dy * dy);
}

export function findNearestBeacon(name) {
  const query = String(name ?? '').trim().toLowerCase();
  if (!query) return null;

  const position = Hive.self.getPosition();
  let nearest = null;
  let nearestDistance = Infinity;

  for (const beacon of Hive.world.objects.getBeacons()) {
    if (!String(beacon.name ?? '').toLowerCase().includes(query)) continue;

    const currentDistance = distanceSquared(position, beacon.position);
    if (currentDistance < nearestDistance) {
      nearest = beacon;
      nearestDistance = currentDistance;
    }
  }

  return nearest;
}

export function isWithinBeaconRadius(beacon, radius) {
  if (!beacon) return false;

  const safeRadius = Math.max(0, Number(radius) || 0);
  return Hive.self.distanceTo(beacon.position) <= safeRadius;
}
