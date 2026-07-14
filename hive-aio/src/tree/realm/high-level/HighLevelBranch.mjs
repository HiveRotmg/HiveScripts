import { Branch, Hive } from '@hive/sdk';
import { LIMITS } from '../../../config/constants.mjs?rev=deepsea-20260713';
import { HighLevelPlaceholderLeaf } from './placeholder/HighLevelPlaceholderLeaf.mjs?rev=deepsea-20260713';

export class HighLevelBranch extends Branch {
  constructor(controller) {
    super('Level Above 20');
    this.controller = controller;
    this.addLeaves(new HighLevelPlaceholderLeaf());
  }

  isValid() {
    return Hive.self.getLevel() > LIMITS.deepSeaLevelInclusiveMaximum;
  }
}
