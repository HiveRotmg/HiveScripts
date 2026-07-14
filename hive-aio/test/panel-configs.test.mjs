import assert from 'node:assert/strict';
import test from 'node:test';
import HiveAIO from '../src/HiveAIO.mjs';

function createHarness() {
  const controller = new HiveAIO();
  const values = new Map([['config-name', 'default']]);
  const configs = new Set(['default', 'farming']);
  const calls = [];
  const activity = [];
  let refreshes = 0;
  const panel = {
    activeConfig: 'default',
    listConfigs: () => [...configs].map((name) => ({ name, updatedAt: 1 })),
    setOptions: (id, options) => calls.push(['options', id, options]),
    setValue: (id, value) => values.set(id, value),
    getValue: (id) => values.get(id),
    saveConfig(name) {
      calls.push(['save', name]);
      configs.add(name);
      this.activeConfig = name;
      return { name, updatedAt: 1 };
    },
    loadConfig(name) {
      calls.push(['load', name]);
      if (!configs.has(name)) return false;
      this.activeConfig = name;
      return true;
    },
    deleteConfig(name) {
      calls.push(['delete', name]);
      const deleted = configs.delete(name);
      if (deleted && this.activeConfig === name) this.activeConfig = 'default';
      return deleted;
    },
  };
  controller.state.panel = panel;
  controller.appendActivity = (message) => activity.push(message);
  controller.refreshPanel = () => { refreshes += 1; };
  return { controller, panel, values, configs, calls, activity, refreshes: () => refreshes };
}

test('Hive AIO config controls save, load, select, and delete named configs', () => {
  const harness = createHarness();
  const { controller, panel, values, configs, calls, activity } = harness;

  controller.refreshPanelConfigs('farming');
  assert.equal(values.get('config-select'), 'farming');
  assert.equal(values.get('config-name'), 'farming');

  controller.selectPanelConfig('default');
  assert.equal(values.get('config-name'), 'default');

  values.set('config-name', 'bosses');
  controller.savePanelConfig();
  assert.equal(panel.activeConfig, 'bosses');
  assert.equal(configs.has('bosses'), true);
  assert.deepEqual(calls.find((entry) => entry[0] === 'save'), ['save', 'bosses']);
  assert.equal(activity.at(-1), 'Config saved: bosses');

  values.set('config-name', 'farming');
  controller.loadPanelConfig();
  assert.equal(panel.activeConfig, 'farming');
  assert.equal(harness.refreshes(), 1);
  assert.equal(activity.at(-1), 'Config loaded: farming');

  controller.deletePanelConfig();
  assert.equal(configs.has('farming'), false);
  assert.equal(activity.at(-1), 'Config deleted: farming');
});

test('Hive AIO reports a missing config without refreshing live telemetry', () => {
  const harness = createHarness();
  harness.values.set('config-name', 'missing');

  harness.controller.loadPanelConfig();

  assert.equal(harness.refreshes(), 0);
  assert.equal(harness.activity.at(-1), 'Config not found: missing');
});
