import { LIMITS } from '../../../config/constants.mjs?rev=deepsea-20260713';
import { findNearestBeacon, isWithinBeaconRadius } from '../../../world/beacons.mjs?rev=teleport-sync-20260713';

const DEEP_SEA_ABYSS_BEACON_NAME = 'deep sea abyss beacon';

export function findNearestDeepSeaAbyssBeacon() {
  return findNearestBeacon(DEEP_SEA_ABYSS_BEACON_NAME);
}

export function isWithinDeepSeaAbyssBeaconRadius(beacon) {
  return isWithinBeaconRadius(beacon, LIMITS.deepSeaAbyssBeaconRadiusTiles);
}
