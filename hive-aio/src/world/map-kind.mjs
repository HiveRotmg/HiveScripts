import { Hive } from '@hive/sdk';
import { isAnyDungeonMap } from '../tree/dungeons/index.mjs';
import { isOryxsCastleMap } from '../tree/dungeons/oryxs-castle/map.mjs';

export function isRealmMap() {
  const name = Hive.world.getName().trim().toLowerCase();
  return name === 'realm' || name.includes('realm of the mad god');
}

/** @deprecated Prefer dungeon catalog map helpers; kept for HiveAIO vault skip. */
export function isOryxCastleMap() {
  return isOryxsCastleMap();
}

/** Fresh accounts can spawn into the tutorial map before ever seeing Nexus. */
export function isTutorialMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase();
  return name.includes('tutorial');
}

export function getMapKind() {
  if (Hive.world.isNexus()) return 'nexus';
  if (isTutorialMap()) return 'tutorial';
  if (isRealmMap()) return 'realm';
  if (isAnyDungeonMap()) return 'dungeon';
  return 'other';
}
