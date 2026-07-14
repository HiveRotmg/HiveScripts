import { NexusBranch } from './nexus/NexusBranch.mjs?rev=nexus-healers-20260714';
import { OtherMapBranch } from './other-map/OtherMapBranch.mjs';
import { RealmBranch } from './realm/RealmBranch.mjs?rev=combat-range-20260714';
import { StoppedBranch } from './stopped/StoppedBranch.mjs';

export function createTree(controller) {
  const stopped = new StoppedBranch(controller);
  const nexus = new NexusBranch(controller);
  const realm = new RealmBranch(controller);
  const otherMap = new OtherMapBranch(controller);

  return {
    branches: [stopped, nexus, realm, otherMap],
    getCurrentTargetObjectId() {
      return realm.enemyTarget.targetObjectId;
    },
    reset() {
      nexus.reset();
      realm.reset();
    },
    onMapChange(mapKind) {
      realm.reset();
      if (mapKind === 'nexus') nexus.reset();
    },
  };
}
