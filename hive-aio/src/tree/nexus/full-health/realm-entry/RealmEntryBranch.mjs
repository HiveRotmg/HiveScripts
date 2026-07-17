import { Branch } from '@hive/sdk';
import { RealmEntryProgress } from './RealmEntryProgress.mjs?rev=portal-dodge-entry-20260714';
import { EnterOpenRealmLeaf } from './enter-open-realm/EnterOpenRealmLeaf.mjs?rev=portal-dodge-entry-20260714';
import { WaitForRealmTransitionLeaf } from './wait-for-realm-transition/WaitForRealmTransitionLeaf.mjs?rev=portal-dodge-entry-20260714';
import { WalkToPortalWaypointLeaf } from './walk-to-portal-waypoint/WalkToPortalWaypointLeaf.mjs?rev=portal-dodge-entry-20260714';

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
    const { state } = this.controller;
    return state.vault === false
      && state.drinkVaultPotionsActive !== true
      && state.equipVaultUpgradesActive !== true;
  }

  reset() {
    this.progress.reset();
  }
}
