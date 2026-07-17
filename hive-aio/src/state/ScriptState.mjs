export class ScriptState {
  automationRunning = false;
  vault = false;
  vaultOnStartDone = false;
  storageDepositRequested = false;
  storageDepositNonPotions = false;
  storageBlocked = false;
  autoAimEnabled = true;
  autoAbilityEnabled = false;
  autoDodgeEnabled = false;
  projectileNoclipEnabled = false;
  autoLootEnabled = false;
  autoDrinkEnabled = false;
  pickupPotionsEnabled = false;
  /** When true, retrieve and drink unmaxed stat potions from known Vault storage. */
  drinkVaultPotionsEnabled = false;
  /**
   * Intent flag: currently navigating/retrieving/drinking vault potions.
   * While set, preempts realm/dungeon tree work.
   */
  drinkVaultPotionsActive = false;
  /** When true, retrieve and equip vault gear that AutoLoot considers an upgrade. */
  equipVaultUpgradesEnabled = false;
  /**
   * Intent flag: currently navigating/retrieving/equipping vault upgrades.
   * While set, preempts realm/dungeon tree work.
   */
  equipVaultUpgradesActive = false;
  minKeepWeaponTier = 12;
  minKeepAbilityTier = 6;
  minKeepArmorTier = 12;
  minKeepRingTier = 6;
  autoNexusPercent = 20;
  selectedServer = '';
  selectedServerName = '';
  mapKind = 'other';
  /**
   * Farming preference / requested destination (entry intent).
   * Not used by dungeon solvers for activation.
   */
  wantedDungeon = null;
  /**
   * Derived from the current map via dungeon registry (see resolveCurrentDungeonId).
   * Updated on map sync — do not treat as farming intent.
   */
  currentDungeon = null;
  currentTargetObjectId = null;
  panel = null;
  subscriptions = [];
}
