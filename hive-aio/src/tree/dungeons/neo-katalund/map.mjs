import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "neo katalund"
];

export function isNeoKatalundMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
