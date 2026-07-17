import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "oryx's sanctuary",
  "oryxs sanctuary"
];

export function isOryxsSanctuaryMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
