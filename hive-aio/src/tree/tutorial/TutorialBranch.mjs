import { Branch } from '@hive/sdk';
import { isTutorialMap } from '../../world/map-kind.mjs?rev=tutorial-fresh-account-20260717';
import { CompleteTutorialLeaf } from './complete-tutorial/CompleteTutorialLeaf.mjs?rev=tutorial-fresh-account-20260717';

export class TutorialBranch extends Branch {
  constructor(controller) {
    super('Tutorial');
    this.controller = controller;
    this.complete = new CompleteTutorialLeaf(controller);
    this.addLeaves(this.complete);
  }

  isValid() {
    return this.controller.state.automationRunning && isTutorialMap();
  }

  reset() {
    this.complete.reset();
  }
}
