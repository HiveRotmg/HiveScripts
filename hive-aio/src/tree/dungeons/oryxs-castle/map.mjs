import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "oryx's castle",
  "oryxs castle"
];

export function isOryxsCastleMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
