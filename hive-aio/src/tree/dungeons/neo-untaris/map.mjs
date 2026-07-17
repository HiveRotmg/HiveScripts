import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "neo untaris"
];

export function isNeoUntarisMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
