import assert from 'node:assert/strict';
import test from 'node:test';
import { Hive } from '@hive/sdk';
import { createServerControl } from '../src/config/constants.mjs';
import { ScriptState } from '../src/state/ScriptState.mjs';
import { createControlPanel } from '../src/ui/create-control-panel.mjs';

function flatten(widgets) {
  const result = [];
  for (const widget of widgets) {
    result.push(widget);
    if (widget.type === 'group' || widget.type === 'row') {
      result.push(...flatten(widget.children));
    }
    if (widget.type === 'tabs') {
      for (const tab of widget.tabs) result.push(...flatten(tab.children));
    }
  }
  return result;
}

test('control panel exposes the required configuration and telemetry', () => {
  const state = new ScriptState();
  const controller = {
    state,
    changeServer() {},
    startAutomation() {},
    stopAutomation() {},
    setAutoAimEnabled() {},
    setAutoAbilityEnabled() {},
    setAutoDodgeEnabled() {},
    setProjectileNoclipEnabled() {},
    setAutoLootEnabled() {},
    setAutoDrinkEnabled() {},
    setPickupPotionsEnabled() {},
    setLootKeepTier() {},
    setAutoNexusPercent() {},
    selectPanelConfig() {},
    savePanelConfig() {},
    loadPanelConfig() {},
    deletePanelConfig() {},
  };
  const servers = [{ name: 'USWest', address: 'usw.example' }];
  const options = [{ label: 'USWest', value: 'usw.example' }];
  let definition;

  Hive.ui.panel.define = (value) => {
    definition = value;
    return value;
  };

  createControlPanel(controller, servers, options);
  const widgets = flatten(definition.widgets);
  const byId = new Map(widgets.filter((widget) => widget.id).map((widget) => [widget.id, widget]));
  const tabs = definition.widgets[0];
  const overviewIds = new Set(flatten(tabs.tabs[0].children).map((widget) => widget.id).filter(Boolean));
  const settingsIds = new Set(flatten(tabs.tabs[3].children).map((widget) => widget.id).filter(Boolean));

  assert.equal(definition.title, 'Hive AIO');
  assert.equal(definition.width, 520);
  assert.equal(definition.density, 'compact');
  assert.deepEqual(definition.persistence, {
    autoSave: true,
    autoLoad: true,
    config: 'default',
    scope: 'script',
  });
  assert.deepEqual(tabs.tabs.map((tab) => tab.label), ['Overview', 'Combat', 'Loot', 'Settings', 'Logs']);
  assert.equal(overviewIds.has('server'), false);
  assert.equal(settingsIds.has('server'), true);
  assert.deepEqual(byId.get('server').options, options);
  assert.equal(byId.get('server').width, 230);
  assert.equal(byId.get('run-state').type, 'badge');
  assert.equal(byId.get('map-state').type, 'metric');
  assert.equal(byId.get('auto-aim').type, 'toggle');
  assert.equal(byId.get('auto-ability').type, 'toggle');
  assert.equal(byId.get('auto-dodge').type, 'toggle');
  assert.equal(byId.get('projectile-noclip').type, 'toggle');
  assert.equal(byId.get('auto-loot').type, 'toggle');
  assert.equal(byId.get('auto-drink').type, 'toggle');
  assert.equal(byId.get('pickup-potions').type, 'toggle');
  assert.equal(byId.get('keep-weapon-tier').type, 'number');
  assert.equal(byId.get('keep-ability-tier').type, 'number');
  assert.equal(byId.get('keep-armor-tier').type, 'number');
  assert.equal(byId.get('keep-ring-tier').type, 'number');
  assert.equal(byId.get('auto-nexus-percent').type, 'slider');
  assert.equal(byId.get('config-select').type, 'select');
  assert.equal(byId.get('config-select').persist, false);
  assert.equal(byId.get('config-name').type, 'text');
  assert.equal(byId.get('config-name').persist, false);
  assert.equal(byId.get('config-save').type, 'button');
  assert.equal(byId.get('config-load').type, 'button');
  assert.equal(byId.get('config-delete').type, 'button');
  assert.equal(byId.get('health-state').type, 'progress');
  assert.equal(byId.get('current-target').type, 'metric');
  assert.equal(overviewIds.has('current-target'), true);
  assert.equal(byId.get('tree-branch').type, 'metric');
  assert.equal(byId.get('tree-leaf').type, 'metric');
  assert.equal(byId.get('activity-log').type, 'log');
});

test('server control defaults to the account current server', () => {
  const knownResult = createServerControl([
    { name: 'USWest', address: 'usw.example' },
    { name: 'USEast', address: 'use.example' },
  ], 'USE.EXAMPLE');

  assert.equal(knownResult.selectedServer, 'use.example');
  assert.equal(knownResult.selectedLabel, 'USEast');

  const unlistedResult = createServerControl([
    { name: 'USWest', address: 'usw.example' },
  ], 'custom.example');

  assert.equal(unlistedResult.selectedServer, 'custom.example');
  assert.deepEqual(unlistedResult.options[0], {
    label: 'Current server (custom.example)',
    value: 'custom.example',
  });
});
