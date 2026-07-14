import { Hive, Panel } from '@hive/sdk';

export function createControlPanel(controller, servers, serverOptions) {
  const { state } = controller;

  return Hive.ui.panel.define({
    title: 'Hive AIO',
    subtitle: 'Made by Stukov',
    width: 520,
    maxHeight: 680,
    density: 'compact',
    autoOpen: true,
    persistence: {
      autoSave: true,
      autoLoad: true,
      config: 'default',
      scope: 'script',
    },
    widgets: [
      Panel.tabs({
        id: 'aio-tabs',
        value: 'overview',
        tabs: [
          {
            id: 'overview',
            label: 'Overview',
            children: [
              Panel.row([
                Panel.badge('Stopped', {
                  id: 'run-state',
                  tone: 'neutral',
                  width: 'auto',
                }),
                Panel.button({
                  id: 'start-stop',
                  label: 'Start',
                  variant: 'primary',
                  width: 108,
                  onClick: () => {
                    if (state.automationRunning) controller.stopAutomation();
                    else controller.startAutomation();
                  },
                }),
              ], { align: 'center', justify: 'between', gap: 12 }),
              Panel.row([
                Panel.metric({
                  id: 'map-state',
                  label: 'Map',
                  value: 'Unknown',
                  detail: 'Other',
                  tone: 'neutral',
                  grow: true,
                  minWidth: 180,
                }),
                Panel.metric({
                  id: 'level-state',
                  label: 'Level',
                  value: '0',
                  detail: 'Character',
                  tone: 'info',
                  width: 92,
                }),
                Panel.metric({
                  id: 'health-metric',
                  label: 'Health',
                  value: '0 / 0',
                  detail: '0%',
                  tone: 'neutral',
                  width: 132,
                }),
              ], { wrap: true, align: 'stretch', gap: 8 }),
              Panel.progress({
                id: 'health-state',
                value: 0,
                caption: '0 / 0',
              }),
              Panel.metric({
                id: 'current-action',
                label: 'Current Action',
                value: 'None',
                detail: 'Stopped',
                tone: 'neutral',
                width: 'full',
              }),
              Panel.row([
                Panel.badge('Realm entry', {
                  id: 'route-state',
                  tone: 'info',
                  width: 'auto',
                }),
                Panel.badge(state.selectedServerName || state.selectedServer || 'Current server', {
                  id: 'overview-server-state',
                  tone: 'neutral',
                  width: 'auto',
                }),
              ], { wrap: true, align: 'center', justify: 'between', gap: 8 }),
            ],
          },
          {
            id: 'combat',
            label: 'Combat',
            children: [
              Panel.group('Automation', [
                Panel.row([
                  Panel.toggle({
                    id: 'auto-aim',
                    label: 'Autoaim closest enemy',
                    value: state.autoAimEnabled,
                    minWidth: 190,
                    grow: true,
                    onChange: (enabled) => controller.setAutoAimEnabled(enabled),
                  }),
                  Panel.toggle({
                    id: 'auto-ability',
                    label: 'Autoability',
                    value: state.autoAbilityEnabled,
                    minWidth: 150,
                    grow: true,
                    onChange: (enabled) => controller.setAutoAbilityEnabled(enabled),
                  }),
                  Panel.toggle({
                    id: 'auto-dodge',
                    label: 'Autododge',
                    value: state.autoDodgeEnabled,
                    minWidth: 150,
                    grow: true,
                    onChange: (enabled) => controller.setAutoDodgeEnabled(enabled),
                  }),
                  Panel.toggle({
                    id: 'projectile-noclip',
                    label: 'Projectile noclip',
                    value: state.projectileNoclipEnabled,
                    minWidth: 180,
                    grow: true,
                    onChange: (enabled) => controller.setProjectileNoclipEnabled(enabled),
                  }),
                ], { wrap: true, align: 'center', gap: 12 }),
              ], { appearance: 'plain' }),
              Panel.divider('Safety'),
              Panel.group('', [
                Panel.slider({
                  id: 'auto-nexus-percent',
                  label: 'Auto-nexus HP',
                  value: state.autoNexusPercent,
                  min: 1,
                  max: 100,
                  step: 1,
                  unit: '%',
                  onChange: (percent) => controller.setAutoNexusPercent(percent),
                }),
              ], { appearance: 'plain' }),
            ],
          },
          {
            id: 'loot',
            label: 'Loot',
            children: [
              Panel.group('Automation', [
                Panel.toggle({
                  id: 'auto-loot',
                  label: 'Auto loot and equip',
                  value: state.autoLootEnabled,
                  width: 'full',
                  onChange: (enabled) => controller.setAutoLootEnabled(enabled),
                }),
              ], { appearance: 'plain' }),
              Panel.divider('Minimum tier to keep'),
              Panel.group('', [
                Panel.row([
                  Panel.number({
                    id: 'keep-weapon-tier',
                    label: 'Weapon',
                    value: state.minKeepWeaponTier,
                    min: 0,
                    max: 20,
                    step: 1,
                    minWidth: 190,
                    grow: true,
                    onChange: (tier) => controller.setLootKeepTier('weapon', tier),
                  }),
                  Panel.number({
                    id: 'keep-ability-tier',
                    label: 'Ability',
                    value: state.minKeepAbilityTier,
                    min: 0,
                    max: 20,
                    step: 1,
                    minWidth: 190,
                    grow: true,
                    onChange: (tier) => controller.setLootKeepTier('ability', tier),
                  }),
                ], { wrap: true, align: 'end', gap: 12 }),
                Panel.row([
                  Panel.number({
                    id: 'keep-armor-tier',
                    label: 'Armor',
                    value: state.minKeepArmorTier,
                    min: 0,
                    max: 20,
                    step: 1,
                    minWidth: 190,
                    grow: true,
                    onChange: (tier) => controller.setLootKeepTier('armor', tier),
                  }),
                  Panel.number({
                    id: 'keep-ring-tier',
                    label: 'Ring',
                    value: state.minKeepRingTier,
                    min: 0,
                    max: 20,
                    step: 1,
                    minWidth: 190,
                    grow: true,
                    onChange: (tier) => controller.setLootKeepTier('ring', tier),
                  }),
                ], { wrap: true, align: 'end', gap: 12 }),
              ], { appearance: 'plain' }),
            ],
          },
          {
            id: 'settings',
            label: 'Settings',
            children: [
              Panel.group('Configs', [
                Panel.row([
                  Panel.select({
                    id: 'config-select',
                    label: 'Saved config',
                    value: 'default',
                    options: [{ label: 'default', value: 'default' }],
                    persist: false,
                    minWidth: 190,
                    grow: true,
                    onChange: (name) => controller.selectPanelConfig(name),
                  }),
                  Panel.text({
                    id: 'config-name',
                    label: 'Config name',
                    value: 'default',
                    placeholder: 'Config name',
                    persist: false,
                    minWidth: 190,
                    grow: true,
                  }),
                ], { wrap: true, align: 'end', gap: 10 }),
                Panel.row([
                  Panel.button({
                    id: 'config-save',
                    label: 'Save',
                    variant: 'primary',
                    grow: true,
                    onClick: () => controller.savePanelConfig(),
                  }),
                  Panel.button({
                    id: 'config-load',
                    label: 'Load',
                    variant: 'secondary',
                    grow: true,
                    onClick: () => controller.loadPanelConfig(),
                  }),
                  Panel.button({
                    id: 'config-delete',
                    label: 'Delete',
                    variant: 'danger',
                    grow: true,
                    onClick: () => controller.deletePanelConfig(),
                  }),
                ], { wrap: true, align: 'stretch', gap: 8 }),
              ], { appearance: 'outlined' }),
              Panel.group('Connection', [
                Panel.row([
                  Panel.select({
                    id: 'server',
                    label: 'Server',
                    value: state.selectedServer,
                    options: serverOptions,
                    width: 230,
                    onChange: (address) => controller.changeServer(address, servers),
                  }),
                  Panel.badge(state.selectedServerName || state.selectedServer || 'Current server', {
                    id: 'server-state',
                    tone: 'info',
                    width: 'auto',
                  }),
                ], { wrap: true, align: 'end', gap: 10 }),
              ], { appearance: 'outlined' }),
              Panel.metric({
                id: 'routing-state',
                label: 'Nexus Route',
                value: 'Realm entry',
                detail: 'Vault disabled',
                tone: 'info',
                width: 'full',
              }),
            ],
          },
          {
            id: 'logs',
            label: 'Logs',
            children: [
              Panel.row([
                Panel.metric({
                  id: 'tree-branch',
                  label: 'Active Branch',
                  value: 'None',
                  tone: 'neutral',
                  grow: true,
                  minWidth: 180,
                }),
                Panel.metric({
                  id: 'tree-leaf',
                  label: 'Active Leaf',
                  value: 'None',
                  tone: 'neutral',
                  grow: true,
                  minWidth: 180,
                }),
              ], { wrap: true, align: 'stretch', gap: 8 }),
              Panel.group('Activity', [
                Panel.log({ id: 'activity-log', lines: [], maxLines: 100 }),
              ], { appearance: 'plain' }),
            ],
          },
        ],
      }),
    ],
  });
}
