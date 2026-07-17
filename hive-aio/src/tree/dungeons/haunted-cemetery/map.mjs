import { Hive } from '@hive/sdk';

const MAP_ALIASES = [
  "haunted cemetery",
  "haunted cemetery gates",
  "haunted cemetery graves",
  "haunted cemetery final battle",
  "halloween haunted cemetery"
];

export function isHauntedCemeteryMap() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\u2019', "'");
  return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));
}
