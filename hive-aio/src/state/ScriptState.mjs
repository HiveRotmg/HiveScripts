export class ScriptState {
  automationRunning = false;
  vault = false;
  autoAimEnabled = true;
  autoAbilityEnabled = false;
  autoDodgeEnabled = false;
  projectileNoclipEnabled = false;
  autoLootEnabled = false;
  minKeepWeaponTier = 12;
  minKeepAbilityTier = 6;
  minKeepArmorTier = 12;
  minKeepRingTier = 6;
  autoNexusPercent = 20;
  selectedServer = '';
  selectedServerName = '';
  mapKind = 'other';
  panel = null;
  subscriptions = [];
}
