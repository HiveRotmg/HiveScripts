import { Hive } from '@hive/sdk';

export function isRealmMap() {
  const name = Hive.world.getName().trim().toLowerCase();
  return name === 'realm' || name.includes('realm of the mad god');
}

export function isOryxCastleMap() {
  const name = Hive.world.getName().trim().toLowerCase().replaceAll('\u2019', "'");
  return name === "oryx's castle";
}

export function getMapKind() {
  if (Hive.world.isNexus()) return 'nexus';
  if (isRealmMap()) return 'realm';
  return 'other';
}
