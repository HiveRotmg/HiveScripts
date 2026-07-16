import { NexusBranch } from './nexus/NexusBranch.mjs?rev=portal-dodge-entry-20260714';
import { OtherMapBranch } from './other-map/OtherMapBranch.mjs';
import { OryxCastleBranch } from './oryx-castle/OryxCastleBranch.mjs?rev=oryx-castle-safety-v2-20260715';
import { RealmBranch } from './realm/RealmBranch.mjs?rev=distant-enemy-progress-20260716';
import { StoppedBranch } from './stopped/StoppedBranch.mjs';

export function createTree(controller) {
  const stopped = new StoppedBranch(controller);
  const nexus = new NexusBranch(controller);
  const realm = new RealmBranch(controller);
  const oryxCastle = new OryxCastleBranch(controller);
  const otherMap = new OtherMapBranch(controller);

  return {
    branches: [stopped, nexus, realm, oryxCastle, otherMap],
    getCurrentTargetObjectId() {
      return realm.enemyTarget.targetObjectId;
    },
    reset() {
      nexus.reset();
      realm.reset();
      oryxCastle.reset();
    },
    onMapChange(mapKind) {
      realm.reset();
      oryxCastle.reset();
      if (mapKind === 'nexus') nexus.reset();
    },
  };
}
