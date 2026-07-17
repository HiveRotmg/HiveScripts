import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "legacy heroic abyss of demons"
];

export function isLegacyHeroicAbyssOfDemonsMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
