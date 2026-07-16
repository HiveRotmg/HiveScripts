import { Hive, TreeScript } from '@hive/sdk';
import { applyCombatSettings, disableCombatAutomation } from './combat/apply-combat-settings.mjs?rev=goal-owned-dodge-20260714';
import { createServerControl, TIMING } from './config/constants.mjs?rev=combined-navigation-20260714';
import { ScriptState } from './state/ScriptState.mjs?rev=vault-storage-20260715';
import { createTree } from './tree/create-tree.mjs?rev=distant-enemy-progress-20260716';
import { createControlPanel } from './ui/create-control-panel.mjs?rev=pickup-pots-20260714';
import { getMapKind, isOryxCastleMap } from './world/map-kind.mjs?rev=oryx-castle-safety-20260715';
import { AutoLootController } from './loot/AutoLootController.mjs?rev=combined-navigation-20260714';
import { AutoDrinkController } from './loot/AutoDrinkController.mjs?rev=combined-navigation-20260714';
import { VaultManager } from './storage/VaultManager.mjs?rev=vault-storage-inventory-confirm-20260715';

export default class HiveAIO extends TreeScript {
  state = new ScriptState();
  tree = null;
  autoLoot = null;
  autoDrink = null;
  vaultManager = null;

  onStart() {
    const servers = Hive.connection.getKnownServers();
    const currentHost = Hive.connection.getServerHost();
    const serverControl = createServerControl(servers, currentHost);
    this.state.selectedServer = serverControl.selectedServer;
    this.state.selectedServerName = serverControl.selectedLabel;
    this.state.mapKind = getMapKind();

    disableCombatAutomation();
    Hive.autoNexus.enable(this.state.autoNexusPercent);

    this.autoLoot = new AutoLootController(this);
    this.autoDrink = new AutoDrinkController(this);
    this.vaultManager = new VaultManager(this);
    this.state.panel = createControlPanel(this, servers, serverControl.options);
    this.refreshPanelConfigs();
    this.state.subscriptions = [
      Hive.events.onShotFired((event) => {
        if (!this.state.automationRunning) return;
        this.appendActivity(`Shot ${event.bulletId}`);
      }),
      Hive.events.onDamageTaken((event) => {
        if (!this.state.automationRunning) return;
        this.appendActivity(`Damage ${event.amount} (${event.source})`);
      }),
    ];

    this.tree = createTree(this);
    this.addBranches(...this.tree.branches);
    this.idleSleep = TIMING.treeIdleMs;
    Hive.ui.status('Ready');
    this.refreshPanel();
  }

  onLoop() {
    this.synchronizeMapState();
    if (isOryxCastleMap()) {
      const delay = super.onLoop();
      this.refreshPanel();
      return delay;
    }
    const vaultDelay = this.vaultManager?.onLoop();
    if (vaultDelay !== null && vaultDelay !== undefined) {
      this.setCurrentBranchName('Storage');
      this.setCurrentLeafName(this.vaultManager.getActivityLabel());
      this.refreshPanel();
      return vaultDelay;
    }
    const drinkDelay = this.autoDrink?.onLoop();
    if (drinkDelay !== null && drinkDelay !== undefined) {
      this.setCurrentBranchName('Loot');
      this.setCurrentLeafName('Stat Potions');
      this.refreshPanel();
      return drinkDelay;
    }
    const lootDelay = this.autoLoot?.onLoop();
    if (lootDelay !== null && lootDelay !== undefined) {
      this.setCurrentBranchName('Realm');
      this.setCurrentLeafName('Auto Loot');
      this.refreshPanel();
      return lootDelay;
    }
    const delay = super.onLoop();
    this.refreshPanel();
    return delay;
  }

  onStop() {
    for (const unsubscribe of this.state.subscriptions) unsubscribe();
    this.state.subscriptions = [];
    this.state.automationRunning = false;
    this.autoLoot?.reset();
    this.autoDrink?.reset();
    this.vaultManager?.pause();
    disableCombatAutomation();
    Hive.walking.stopMoving();
    Hive.ui.status(null);
    this.state.panel = null;
  }

  startAutomation() {
    this.state.automationRunning = true;
    this.tree?.reset();
    this.autoLoot?.reset();
    this.autoDrink?.reset();
    this.vaultManager?.onAutomationStart();
    Hive.autoNexus.enable(this.state.autoNexusPercent);
    applyCombatSettings(this.state);
    this.state.panel?.setText('start-stop', 'Stop');
    this.appendActivity('Automation started');
    this.refreshPanel();
  }

  stopAutomation() {
    this.state.automationRunning = false;
    this.tree?.reset();
    this.autoLoot?.reset();
    this.autoDrink?.reset();
    this.vaultManager?.pause();
    disableCombatAutomation();
    Hive.walking.stopMoving();
    this.state.panel?.setText('start-stop', 'Start');
    this.appendActivity('Automation stopped');
    this.refreshPanel();
  }

  changeServer(address, servers) {
    if (!address || address === this.state.selectedServer) return;

    this.state.selectedServer = address;
    this.state.selectedServerName = servers.find((server) => server.address === address)?.name ?? address;
    this.tree?.reset();
    this.autoLoot?.reset();
    this.autoDrink?.reset();
    this.vaultManager?.pause();
    disableCombatAutomation();
    const serverName = servers.find((server) => server.address === address)?.name ?? address;
    this.state.panel?.setProps('server-state', { text: serverName, tone: 'info' });
    this.state.panel?.setProps('overview-server-state', { text: serverName, tone: 'neutral' });
    this.appendActivity(`Server: ${serverName}`);
    Hive.connection.reconnect(address);
  }

  setAutoAimEnabled(enabled) {
    this.state.autoAimEnabled = Boolean(enabled);
    applyCombatSettings(this.state);
    this.appendActivity(`Autoaim ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoAbilityEnabled(enabled) {
    this.state.autoAbilityEnabled = Boolean(enabled);
    applyCombatSettings(this.state);
    this.appendActivity(`Autoability ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoDodgeEnabled(enabled) {
    this.state.autoDodgeEnabled = Boolean(enabled);
    if (this.state.autoDodgeEnabled && this.state.automationRunning) {
      Hive.walking.enableAutoDodge({
        safeWalk: true,
        projectileJump: true,
        maxJumpDistance: 1.5,
      });
    } else {
      Hive.walking.disableAutoDodge();
    }
    this.appendActivity(`Autododge ${enabled ? 'enabled' : 'disabled'}`);
  }

  setProjectileNoclipEnabled(enabled) {
    this.state.projectileNoclipEnabled = Boolean(enabled);
    applyCombatSettings(this.state);
    this.appendActivity(`Projectile noclip ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoLootEnabled(enabled) {
    this.state.autoLootEnabled = Boolean(enabled);
    this.autoLoot?.reset();
    this.appendActivity(`Auto loot ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoDrinkEnabled(enabled) {
    this.state.autoDrinkEnabled = Boolean(enabled);
    this.autoDrink?.reset();
    this.appendActivity(`AutoDrink ${enabled ? 'enabled' : 'disabled'}`);
  }

  setPickupPotionsEnabled(enabled) {
    this.state.pickupPotionsEnabled = Boolean(enabled);
    this.autoDrink?.reset();
    this.appendActivity(`Pick up stat potions ${enabled ? 'enabled' : 'disabled'}`);
  }

  setLootKeepTier(category, tier) {
    const keys = {
      weapon: 'minKeepWeaponTier',
      ability: 'minKeepAbilityTier',
      armor: 'minKeepArmorTier',
      ring: 'minKeepRingTier',
    };
    const key = keys[category];
    if (!key) return;
    this.state[key] = Math.max(0, Math.min(20, Math.round(Number(tier) || 0)));
    this.autoLoot?.reset();
    this.appendActivity(`${category[0].toUpperCase()}${category.slice(1)} keep tier T${this.state[key]}+`);
  }

  setAutoNexusPercent(percent) {
    this.state.autoNexusPercent = Math.max(1, Math.min(100, Math.round(percent)));
    Hive.autoNexus.setThreshold(this.state.autoNexusPercent);
    this.appendActivity(`Auto-nexus ${this.state.autoNexusPercent}%`);
  }

  selectPanelConfig(name) {
    const normalized = String(name || '').trim() || 'default';
    this.state.panel?.setValue('config-name', normalized);
  }

  refreshPanelConfigs(preferredName) {
    const panel = this.state.panel;
    if (!panel) return;

    const names = new Set(['default']);
    for (const config of panel.listConfigs()) names.add(config.name);
    const options = [...names]
      .sort((left, right) => left.localeCompare(right))
      .map((name) => ({ label: name, value: name }));
    const requested = String(preferredName || panel.activeConfig || 'default').trim() || 'default';
    const selected = names.has(requested) ? requested : 'default';
    panel.setOptions('config-select', options);
    panel.setValue('config-select', selected);
    panel.setValue('config-name', selected);
  }

  savePanelConfig() {
    const panel = this.state.panel;
    if (!panel) return;
    const name = String(panel.getValue('config-name') || '').trim() || 'default';
    try {
      panel.saveConfig(name);
      this.refreshPanelConfigs(name);
      this.appendActivity(`Config saved: ${name}`);
    } catch (error) {
      this.appendActivity(`Config save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  loadPanelConfig() {
    const panel = this.state.panel;
    if (!panel) return;
    const name = String(panel.getValue('config-name') || '').trim() || 'default';
    if (!panel.loadConfig(name)) {
      this.appendActivity(`Config not found: ${name}`);
      return;
    }
    this.refreshPanelConfigs(name);
    this.appendActivity(`Config loaded: ${name}`);
    this.refreshPanel();
  }

  deletePanelConfig() {
    const panel = this.state.panel;
    if (!panel) return;
    const name = String(panel.getValue('config-name') || '').trim() || 'default';
    if (!panel.deleteConfig(name)) {
      this.appendActivity(`Config not found: ${name}`);
      return;
    }
    this.refreshPanelConfigs();
    this.appendActivity(`Config deleted: ${name}`);
  }

  synchronizeMapState() {
    const nextMapKind = getMapKind();
    if (nextMapKind === this.state.mapKind) return;

    this.state.mapKind = nextMapKind;
    this.tree?.onMapChange(nextMapKind);
    this.autoLoot?.reset();
    this.autoDrink?.reset();
    applyCombatSettings(this.state);
    this.appendActivity(`Map: ${Hive.world.getName() || 'Unknown'}`);
  }

  refreshPanel() {
    const panel = this.state.panel;
    if (!panel) return;

    const hp = Hive.self.getHP();
    const maxHp = Hive.self.getMaxHP();
    const healthRatio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    const healthPercent = Math.round(healthRatio * 100);
    const branch = this.getCurrentBranchName() || 'None';
    const leaf = this.getCurrentLeafName() || 'None';
    const mapName = Hive.world.getName() || 'Unknown';
    const level = Hive.self.getLevel();
    const targetObjectId = typeof this.tree?.getCurrentTargetObjectId === 'function'
      ? this.tree.getCurrentTargetObjectId()
      : this.state.currentTargetObjectId;
    this.state.currentTargetObjectId = targetObjectId;
    const currentTarget = targetObjectId === null
      ? null
      : Hive.enemies.getById(targetObjectId);
    if (!currentTarget && targetObjectId !== null) this.state.currentTargetObjectId = null;
    const targetDistance = currentTarget
      ? Hive.self.distanceTo(currentTarget.position)
      : null;
    const targetDetail = currentTarget
      ? [
          `Object ${currentTarget.objectId}`,
          Number.isFinite(targetDistance) ? `${targetDistance.toFixed(1)} tiles` : null,
          Number(currentTarget.maxHp) > 0
            ? `${Math.max(0, Number(currentTarget.hp) || 0)} / ${Number(currentTarget.maxHp)} HP`
            : null,
        ].filter(Boolean).join(' | ')
      : 'No active enemy';
    const routeName = this.vaultManager?.getRouteName()
      || (this.state.vault ? 'Vault placeholder' : 'Realm entry');
    const mapTone = this.state.mapKind === 'realm'
      ? 'success'
      : (this.state.mapKind === 'nexus' ? 'info' : 'warning');
    const healthTone = maxHp > 0 && hp >= maxHp
      ? 'success'
      : (healthPercent <= this.state.autoNexusPercent ? 'danger' : 'warning');

    panel.setProps('run-state', {
      text: this.state.automationRunning ? 'Running' : 'Stopped',
      tone: this.state.automationRunning ? 'success' : 'neutral',
    });
    panel.setProps('start-stop', {
      label: this.state.automationRunning ? 'Stop' : 'Start',
      variant: this.state.automationRunning ? 'danger' : 'primary',
    });
    panel.setProps('map-state', {
      value: mapName,
      detail: this.state.mapKind === 'other' ? 'Other map' : this.state.mapKind,
      tone: mapTone,
    });
    panel.setProps('level-state', {
      value: String(level),
      detail: level < 8
        ? 'Nearest enemy'
        : (level < 14
          ? 'Random Forest / Undead / Desert'
          : (level <= 20 ? 'Deep Sea Abyss' : 'Level 21+')),
      tone: level < 8 ? 'warning' : 'info',
    });
    panel.setProps('health-metric', {
      value: `${hp} / ${maxHp}`,
      detail: `${healthPercent}%`,
      tone: healthTone,
    });
    panel.setValue('health-state', healthRatio);
    panel.setText('health-state', `${hp} / ${maxHp}`);
    panel.setProps('current-action', {
      value: leaf,
      detail: branch,
      tone: this.state.automationRunning ? 'info' : 'neutral',
    });
    panel.setProps('current-target', {
      value: currentTarget?.name || (currentTarget ? `Enemy ${currentTarget.objectId}` : 'None'),
      detail: targetDetail,
      tone: currentTarget ? (currentTarget.isBoss ? 'danger' : 'warning') : 'neutral',
    });
    panel.setProps('tree-branch', { value: branch });
    panel.setProps('tree-leaf', { value: leaf });
    panel.setProps('route-state', { text: routeName });
    panel.setProps('routing-state', {
      value: routeName,
      detail: this.vaultManager?.getRouteName() ? 'Storage workflow active' : 'Realm routing active',
    });
    panel.setProps('server-state', { text: this.state.selectedServerName || this.state.selectedServer });
    panel.setProps('overview-server-state', { text: this.state.selectedServerName || this.state.selectedServer });
    Hive.ui.status(this.state.automationRunning ? leaf : 'Ready');
  }

  appendActivity(message) {
    const stamp = new Date().toLocaleTimeString();
    this.state.panel?.appendLog('activity-log', `${stamp}  ${message}`);
  }
}
