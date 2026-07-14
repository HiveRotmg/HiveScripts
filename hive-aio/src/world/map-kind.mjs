import { Hive } from '@hive/sdk';

export function isRealmMap() {
  const name = Hive.world.getName().trim().toLowerCase();
  return name === 'realm' || name.includes('realm of the mad god');
}

export function getMapKind() {
  if (Hive.world.isNexus()) return 'nexus';
  if (isRealmMap()) return 'realm';
  return 'other';
}
