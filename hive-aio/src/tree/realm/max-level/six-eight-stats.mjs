import { Hive } from '@hive/sdk';

// Temporary testing override: remove this once the maxing tasks are live.
export const ENABLE_ATTACK_MAXING_WHEN_MAXED_FOR_TESTING = true;

export const SIX_EIGHT_STATS = Object.freeze([
  Object.freeze({ key: 'attack', taskName: 'Attack-Maxing' }),
  Object.freeze({ key: 'speed', taskName: 'Speed-Maxing' }),
  Object.freeze({ key: 'defense', taskName: 'Defense-Maxing' }),
  Object.freeze({ key: 'wisdom', taskName: 'Wisdom-Maxing' }),
  Object.freeze({ key: 'vitality', taskName: 'Vitality-Maxing' }),
  Object.freeze({ key: 'dexterity', taskName: 'Dexterity-Maxing' }),
]);

export function needsSixEightStat(key) {
  const current = Number(Hive.self.getBaseStats()?.[key]);
  const cap = Number(Hive.self.getStatCaps()?.[key]);
  return Number.isFinite(current) && Number.isFinite(cap) && cap > 0 && current < cap;
}

export function hasUnmaxedSixEightStat() {
  return SIX_EIGHT_STATS.some(({ key }) => needsSixEightStat(key));
}
