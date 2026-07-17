import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "davy jones' locker",
  "davy jones locker"
];

export function isDavyJonesLockerMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
