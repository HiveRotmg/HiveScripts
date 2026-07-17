import { Hive } from '@hive/sdk';

export function callOptional(receiver, method, ...args) {
  const fn = receiver?.[method];
  return typeof fn === 'function' ? fn.call(receiver, ...args) : undefined;
}

export function stopMoving() {
  return callOptional(Hive.walking, 'stopMoving');
}

export function setAutoNexus(percent) {
  if (typeof Hive.autoNexus?.enable === 'function') return Hive.autoNexus.enable(percent);
  return callOptional(Hive.autoNexus, 'setThreshold', percent);
}

export function supportsModernNavigation() {
  return typeof Hive.walking?.navigateTo === 'function';
}

export function supportsCombatNavigation() {
  return typeof Hive.walking?.navigateToCombatTarget === 'function';
}
