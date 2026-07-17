import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "the third dimension",
  "third dimension"
];

export function isTheThirdDimensionMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
