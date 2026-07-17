import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "lair of shaitan",
  "old lair of shaitan"
];

export function isLairOfShaitanMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
