import { DungeonRouterBranch } from './dungeons/DungeonRouterBranch.mjs';
import { NexusBranch } from './nexus/NexusBranch.mjs?rev=portal-dodge-entry-20260714';
import { OtherMapBranch } from './other-map/OtherMapBranch.mjs';
import { RealmBranch } from './realm/RealmBranch.mjs?rev=direct-enemy-pathfinding-20260716';
import { StoppedBranch } from './stopped/StoppedBranch.mjs';
import { TutorialBranch } from './tutorial/TutorialBranch.mjs?rev=tutorial-fresh-account-20260717';

export function createTree(controller) {
  const stopped = new StoppedBranch(controller);
  const tutorial = new TutorialBranch(controller);
  const nexus = new NexusBranch(controller);
  const realm = new RealmBranch(controller);
  const dungeons = new DungeonRouterBranch(controller);
  const otherMap = new OtherMapBranch(controller);

  return {
    branches: [stopped, tutorial, nexus, realm, dungeons, otherMap],
    getCurrentTargetObjectId() {
      return realm.enemyTarget.targetObjectId;
    },
    reset() {
      tutorial.reset();
      nexus.reset();
      realm.reset();
      dungeons.reset();
    },
    onMapChange(mapKind) {
      tutorial.reset();
      realm.reset();
      dungeons.reset();
      if (mapKind === 'nexus') nexus.reset();
    },
  };
}
