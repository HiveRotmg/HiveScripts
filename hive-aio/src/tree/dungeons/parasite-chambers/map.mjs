import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "parasite chambers"
];

export function isParasiteChambersMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
