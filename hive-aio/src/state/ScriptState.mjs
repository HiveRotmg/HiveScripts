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
  minKeepWeaponTier = 12;
  minKeepAbilityTier = 6;
  minKeepArmorTier = 12;
  minKeepRingTier = 6;
  autoNexusPercent = 20;
  selectedServer = '';
  selectedServerName = '';
  mapKind = 'other';
  currentTargetObjectId = null;
  panel = null;
  subscriptions = [];
}
