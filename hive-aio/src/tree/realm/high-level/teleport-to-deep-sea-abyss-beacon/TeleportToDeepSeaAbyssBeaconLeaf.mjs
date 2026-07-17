import { Hive, Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs?rev=deepsea-20260713';
import {
  findNearestDeepSeaAbyssBeacon,
  isWithinDeepSeaAbyssBeaconRadius,
} from '../deep-sea-beacon.mjs?rev=teleport-sync-20260713';
import { stopMoving } from '../../../../sdk/compat.mjs';

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
      stopMoving();
      return TIMING.beaconRefreshMs;
    }
    if (isWithinDeepSeaAbyssBeaconRadius(beacon)) return TIMING.beaconRefreshMs;

    stopMoving();
    if (!Hive.walking.canTeleport()) return TIMING.beaconRefreshMs;

    const teleported = typeof Hive.walking.teleportBeacon === 'function'
      ? Hive.walking.teleportBeacon('deepsea')
      : Hive.walking.teleportToBeacon(beacon.objectId);
    return teleported ? TIMING.beaconTeleportRetryMs : TIMING.beaconRefreshMs;
  }
}
