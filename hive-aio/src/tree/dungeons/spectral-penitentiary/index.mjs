import { SpectralPenitentiaryBranch } from './SpectralPenitentiaryBranch.mjs';
import { isSpectralPenitentiaryMap } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: "spectral-penitentiary",
  name: "Spectral Penitentiary",
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: isSpectralPenitentiaryMap,
  createBranch(controller) {
    return new SpectralPenitentiaryBranch(controller);
  },
};
