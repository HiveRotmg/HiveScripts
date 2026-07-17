import { Branch } from '@hive/sdk';
import { dungeonDefinitions, isAnyDungeonMap } from './index.mjs';

/**
 * Top-level dungeon context. Valid on any registered dungeon map.
 * Child solvers still select themselves via their own map checks.
 */
export class DungeonRouterBranch extends Branch {
  constructor(controller, definitions = dungeonDefinitions) {
    super('Dungeons');
    this.controller = controller;
    this.definitions = definitions;
    this.dungeonBranches = definitions.map((definition) => definition.createBranch(controller));
    this.addLeaves(...this.dungeonBranches);
  }

  isValid() {
    return this.controller.state.automationRunning && isAnyDungeonMap();
  }

  reset() {
    for (const branch of this.dungeonBranches) {
      branch.reset?.();
    }
  }
}
