import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "crystal cavern"
];

export function isCrystalCavernMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
