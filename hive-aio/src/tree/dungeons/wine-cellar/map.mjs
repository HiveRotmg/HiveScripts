import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "wine cellar",
  "wine cellar short"
];

export function isWineCellarMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
