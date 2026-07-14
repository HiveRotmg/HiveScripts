import { Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=beacon-walk-fallback-20260714';

const LOW_LEVEL_BEACON_TYPES = Object.freeze([
  { destination: 'forest', objectType: 52974, name: 'teleport beacon forest' },
  { destination: 'undead forest', objectType: 52975, name: 'teleport beacon undead forest' },
  { destination: 'desert', objectType: 52976, name: 'teleport beacon desert' },
]);

function objectTypeOf(beacon) {
  return Number(beacon?.objectType ?? beacon?.type);
}

function typeForBeacon(beacon) {
  const objectType = objectTypeOf(beacon);
  const name = String(beacon?.name ?? '').trim().toLowerCase();

  return LOW_LEVEL_BEACON_TYPES.find((type) => (
    objectType === type.objectType
    || name === type.name
    || name.startsWith(`${type.name} `)
  )) ?? null;
}

function randomIndex(length) {
  return Math.min(length - 1, Math.floor(Math.random() * length));
}

export class LowLevelBeaconRoute {
  selectedObjectId = null;
  canChooseAnother = false;

  reset() {
    this.selectedObjectId = null;
    this.canChooseAnother = false;
  }

  getSelectedBeacon() {
    if (this.selectedObjectId === null) return null;

    return this.getAvailableBeacons().find((beacon) => (
      beacon.objectId === this.selectedObjectId
    )) ?? null;
  }

  hasAvailableBeacons() {
    return this.getAvailableBeacons().length > 0;
  }

  isWithinSelectedBeaconRadius() {
    const beacon = this.getSelectedBeacon();
    const isWithinRadius = Boolean(beacon)
      && Hive.self.distanceTo(beacon.position) <= LIMITS.plainsBeaconRadiusTiles;

    if (isWithinRadius) this.canChooseAnother = true;
    return isWithinRadius;
  }

  selectBeaconForTeleport() {
    const available = this.getAvailableBeacons();
    if (available.length === 0) return null;

    const selected = this.getSelectedBeacon();
    if (selected && !this.canChooseAnother) return selected;

    const alternatives = selected && this.canChooseAnother
      ? available.filter((beacon) => beacon.destination !== selected.destination)
      : available;
    const candidates = alternatives.length > 0 ? alternatives : available;
    const destinations = [...new Set(candidates.map((beacon) => beacon.destination))];
    const destination = destinations[randomIndex(destinations.length)];
    const matchingBeacons = candidates.filter((beacon) => beacon.destination === destination);
    const next = matchingBeacons[randomIndex(matchingBeacons.length)];

    this.selectedObjectId = next.objectId;
    this.canChooseAnother = false;
    return next;
  }

  getAvailableBeacons() {
    return Hive.world.objects.getBeacons().flatMap((beacon) => {
      const type = typeForBeacon(beacon);
      return type ? [{ ...beacon, destination: type.destination }] : [];
    });
  }
}
