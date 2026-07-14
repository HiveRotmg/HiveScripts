import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=beacon-walk-fallback-20260714';

export class TeleportToLowLevelBeaconLeaf extends Leaf {
  constructor(route) {
    super('Teleport To Random Beacon');
    this.route = route;
  }

  isValid() {
    return this.route.hasAvailableBeacons()
      && !this.route.isWithinSelectedBeaconRadius();
  }

  onLoop() {
    const beacon = this.route.selectBeaconForTeleport();
    if (!beacon) {
      Hive.walking.stopMoving();
      return TIMING.beaconRefreshMs;
    }
    if (this.route.isWithinSelectedBeaconRadius()) return TIMING.beaconRefreshMs;

    Hive.walking.stopMoving();
    if (!Hive.walking.canTeleport()) return TIMING.beaconRefreshMs;

    const teleported = Hive.walking.teleportToBeacon(beacon.objectId);
    return teleported ? TIMING.beaconTeleportRetryMs : TIMING.beaconRefreshMs;
  }
}
