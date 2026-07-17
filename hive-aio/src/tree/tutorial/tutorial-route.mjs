export const TUTORIAL_WAIT_MS = 1000;
export const EVIL_CHICKEN_GOD_TYPE = 0x6b1; // 1713
export const EXALTED_KITCHEN_PORTAL_TYPE = 635; // 0x27B

export const TUTORIAL_WAYPOINTS = Object.freeze([
  Object.freeze({ x: 120, y: 220 }),
  Object.freeze({ x: 128, y: 94, waitMs: TUTORIAL_WAIT_MS, enableAutoAim: true }),
  Object.freeze({ x: 128, y: 71, waitMs: TUTORIAL_WAIT_MS }),
  Object.freeze({ x: 128, y: 61 }),
]);

export const TUTORIAL_POST_BOSS_WAYPOINTS = Object.freeze([
  Object.freeze({ x: 128, y: 45, waitMs: TUTORIAL_WAIT_MS }),
  Object.freeze({ x: 128, y: 33, waitMs: TUTORIAL_WAIT_MS }),
  Object.freeze({ x: 128, y: 29 }),
]);

export const TUTORIAL_ARRIVAL_TOLERANCE = 0.5;
export const TUTORIAL_PORTAL_TOLERANCE = 1.0;
export const TUTORIAL_PORTAL_RETRY_MS = 1500;
