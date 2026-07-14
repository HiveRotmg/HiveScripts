import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=deepsea-20260713';
import {
  findNearestDeepSeaAbyssBeacon,
  isWithinDeepSeaAbyssBeaconRadius,
} from '../deep-sea-beacon.mjs?rev=teleport-sync-20260713';

export class TeleportToDeepSeaAbyssBeaconLeaf extends Leaf {
  constructor() {
    super('Teleport To Deep Sea Abyss Beacon');
  }

  isValid() {
    const beacon = findNearestDeepSeaAbyssBeacon();
    return !beacon || !isWithinDeepSeaAbyssBeaconRadius(beacon);
  }

  onLoop() {
    const beacon = findNearestDeepSeaAbyssBeacon();
    if (!beacon) {
      Hive.walking.stopMoving();
      return TIMING.beaconRefreshMs;
    }
    if (isWithinDeepSeaAbyssBeaconRadius(beacon)) return TIMING.beaconRefreshMs;

    Hive.walking.stopMoving();
    if (!Hive.walking.canTeleport()) return TIMING.beaconRefreshMs;

    const teleported = Hive.walking.teleportBeacon('deepsea');
    return teleported ? TIMING.beaconTeleportRetryMs : TIMING.beaconRefreshMs;
  }
}
