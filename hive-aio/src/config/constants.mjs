export const NEXUS_PORTAL_WAYPOINT = Object.freeze({ x: 108, y: 140 });
export const NEXUS_HEALING_WAYPOINT = Object.freeze({ x: 107, y: 158 });

export const TIMING = Object.freeze({
  treeIdleMs: 250,
  placeholderPollMs: 1000,
  nexusPollMs: 200,
  waypointRetryMs: 4000,
  portalApproachRetryMs: 2500,
  portalUseRetryMs: 1500,
  portalTransitionTimeoutMs: 12000,
  portalFailureCooldownMs: 10000,
  enemyRefreshMs: 250,
  beaconRefreshMs: 1000,
  beaconTeleportRetryMs: 3000,
});

export const LIMITS = Object.freeze({
  waypointTolerance: 0.6,
  maxWaypointRetries: 3,
  portalUseTolerance: 0.45,
  maxPortalUseAttempts: 5,
  lowLevelExclusiveMaximum: 8,
  plainsLevelExclusiveMaximum: 14,
  deepSeaLevelInclusiveMaximum: 20,
  plainsBeaconRadiusTiles: 150,
  deepSeaAbyssBeaconRadiusTiles: 250,
  enemyTargetSwitchAdvantageTiles: 10,
  enemyExclusionDistanceTiles: 1.3,
  preferredCombatRangeRatio: 0.75,
});

function normalizeServerAddress(address) {
  return String(address ?? '').trim().toLowerCase();
}

export function createServerControl(servers, currentHost) {
  const knownServers = Array.isArray(servers) ? servers : [];
  const host = String(currentHost ?? '').trim();
  const normalizedHost = normalizeServerAddress(host);
  const currentServer = knownServers.find(
    (server) => normalizeServerAddress(server.address) === normalizedHost,
  );

  const selectedServer = currentServer?.address
    || host
    || knownServers[0]?.address
    || '';
  const selectedLabel = currentServer?.name
    || host
    || knownServers[0]?.name
    || 'Current server';
  const options = knownServers.map((server) => ({
    label: server.name,
    value: server.address,
  }));

  if (host && !currentServer) {
    options.unshift({
      label: `Current server (${host})`,
      value: host,
    });
  }

  if (options.length === 0) {
    options.push({
      label: host || 'Current server',
      value: host,
    });
  }

  return { selectedServer, selectedLabel, options };
}
