import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "oryx's chamber",
  "oryxs chamber"
];

export function isOryxsChamberMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
