import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "kitchen"
];

export function isKitchenMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias);
}
