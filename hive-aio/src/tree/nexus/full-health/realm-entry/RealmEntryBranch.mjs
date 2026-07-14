import { Branch } from '@hive/sdk';
import { RealmEntryProgress } from './RealmEntryProgress.mjs';
import { EnterOpenRealmLeaf } from './enter-open-realm/EnterOpenRealmLeaf.mjs';
import { WaitForRealmTransitionLeaf } from './wait-for-realm-transition/WaitForRealmTransitionLeaf.mjs';
import { WalkToPortalWaypointLeaf } from './walk-to-portal-waypoint/WalkToPortalWaypointLeaf.mjs';

export class RealmEntryBranch extends Branch {
  constructor(controller) {
    super('Realm Entry');
    this.controller = controller;
    this.progress = new RealmEntryProgress();
    this.addLeaves(
      new WalkToPortalWaypointLeaf(controller, this.progress),
      new EnterOpenRealmLeaf(controller, this.progress),
      new WaitForRealmTransitionLeaf(controller, this.progress),
    );
  }

  isValid() {
    return this.controller.state.vault === false;
  }

  reset() {
    this.progress.reset();
  }
}
