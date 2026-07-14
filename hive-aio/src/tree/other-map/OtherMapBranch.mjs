import { Branch } from '@hive/sdk';
import { getMapKind } from '../../world/map-kind.mjs';
import { WaitForSupportedMapLeaf } from './wait/WaitForSupportedMapLeaf.mjs';

export class OtherMapBranch extends Branch {
  constructor(controller) {
    super('Other Map');
    this.controller = controller;
    this.addLeaves(new WaitForSupportedMapLeaf());
  }

  isValid() {
    return this.controller.state.automationRunning && getMapKind() === 'other';
  }
}
