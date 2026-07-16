import { Hive } from '@hive/sdk';
import { potionStat } from '../loot/AutoDrinkController.mjs?rev=vault-storage-20260715';

const POLL_MS = 200;
const ROUTE_RETRY_MS = 3000;
const STARTUP_POPULATE_MS = 5000;
const TRANSFER_TIMEOUT_MS = 25000;
const TRANSFER_SETTLE_MS = 750;
const NO_DEPOSIT_CONFIRM_MS = 2000;

function isVaultMap() {
  return Hive.world.getName().trim().toLowerCase().includes('vault');
}

function carriedMaximumSlot() {
  try {
    const backpack = Number(Hive.inventory.getBackpack()) || 1;
    if (backpack >= 3) return 27;
    if (backpack >= 2) return 19;
  } catch {
    // The main inventory remains usable before backpack telemetry arrives.
  }
  return 11;
}

export class VaultManager {
  constructor(controller) {
    this.controller = controller;
    this.phase = 'startup-route';
    this.activity = 'Initialize Vault';
    this.populateStartedAt = 0;
    this.lastRouteCommandAt = 0;
    this.pendingTransfer = null;
    this.nextTransferAt = 0;
    this.noDepositSince = 0;
    this.reservedDestinations = new Map();
    this.lastBlockedMessage = '';
  }

  onAutomationStart() {
    this.pendingTransfer = null;
    this.nextTransferAt = 0;
    this.noDepositSince = 0;
    this.reservedDestinations.clear();
    this.lastRouteCommandAt = 0;
    this.lastBlockedMessage = '';
    this.phase = this.controller.state.vaultOnStartDone ? 'idle' : 'startup-route';
    if (!this.controller.state.vaultOnStartDone && this.hasCompleteVaultSnapshot()) {
      this.controller.state.vaultOnStartDone = true;
      this.phase = 'idle';
      this.activity = 'Vault Ready';
      this.controller.appendActivity('Using cached Vault storage data');
    }
  }

  pause() {
    this.pendingTransfer = null;
    this.nextTransferAt = 0;
    this.noDepositSince = 0;
    this.reservedDestinations.clear();
    this.lastRouteCommandAt = 0;
  }

  getActivityLabel() {
    return this.activity;
  }

  getRouteName() {
    if (!this.controller.state.vaultOnStartDone) return 'Vault initialization';
    if (this.phase.startsWith('deposit') || this.phase === 'storage-return') return 'Storage deposit';
    if (this.controller.state.storageBlocked) return 'Storage full';
    return null;
  }

  onLoop() {
    if (!this.controller.state.automationRunning) return null;
    if (!this.controller.state.vaultOnStartDone) return this.runStartup();
    return this.runDeposits();
  }

  runStartup() {
    this.activity = 'Initialize Vault';

    if (isVaultMap()) {
      if (this.phase === 'startup-return') {
        this.routeToNexus('Returning to Nexus after Vault initialization');
        return POLL_MS;
      }

      if (this.phase !== 'startup-populate') {
        Hive.walking.stopMoving();
        this.phase = 'startup-populate';
        this.populateStartedAt = Date.now();
        this.controller.appendActivity('Vault entered; waiting for storage data');
      }

      const snapshot = this.vaultSnapshot();
      if (Date.now() - this.populateStartedAt < STARTUP_POPULATE_MS || !snapshot?.complete) {
        this.activity = 'Load Vault Data';
        return POLL_MS;
      }

      this.phase = 'startup-return';
      this.routeToNexus('Vault data loaded; returning to Nexus', true);
      return POLL_MS;
    }

    if (Hive.world.isNexus()) {
      if (this.phase === 'startup-return') {
        this.controller.state.vaultOnStartDone = true;
        this.phase = 'idle';
        this.activity = 'Vault Ready';
        this.controller.appendActivity('Vault initialization complete');
        return POLL_MS;
      }

      this.activity = 'Enter Vault';
      this.enterVault('Entering Vault to load storage data');
      return POLL_MS;
    }

    this.activity = 'Return To Nexus';
    this.routeToNexus('Returning to Nexus for Vault initialization');
    return POLL_MS;
  }

  runDeposits() {
    const inventory = Hive.inventory.getAll();
    const carried = this.carriedSlots(inventory);
    const inventoryFull = carried.length > 0 && carried.every(({ objectType }) => objectType >= 0);

    if (this.isRealmMap()) {
      if (!inventoryFull) return null;
      this.controller.state.storageDepositRequested = true;
      this.controller.state.storageDepositNonPotions = true;
      this.controller.state.storageBlocked = false;
      this.phase = 'deposit-route-nexus';
      this.activity = 'Nexus Full Inventory';
      this.routeToNexus('Inventory full; nexusing to deposit items');
      return POLL_MS;
    }

    if (Hive.world.isNexus()) {
      if (this.phase === 'storage-return') {
        this.phase = 'idle';
        this.lastRouteCommandAt = 0;
      }

      // Also recover when the client nexused independently after the last Realm loop.
      if (inventoryFull && !this.controller.state.storageDepositRequested) {
        this.controller.state.storageDepositRequested = true;
        this.controller.state.storageDepositNonPotions = true;
        this.controller.state.storageBlocked = false;
      }

      const plan = this.nextDeposit(inventory, false);
      if (plan || this.controller.state.storageDepositRequested) {
        if (!plan) {
          this.controller.state.storageBlocked = inventoryFull;
          if (inventoryFull) {
            this.activity = 'Storage Full';
            this.logBlocked('Inventory is full and no matching storage space is available');
            return POLL_MS;
          }
          this.finishDepositVisit();
          return null;
        }

        this.controller.state.storageBlocked = false;
        this.phase = 'deposit-enter-vault';
        this.activity = 'Enter Vault For Deposit';
        this.enterVault('Storage deposit needed; entering Vault');
        return POLL_MS;
      }
      return null;
    }

    if (!isVaultMap()) return null;

    this.activity = 'Deposit Inventory';
    const snapshot = this.vaultSnapshot();
    if (!snapshot?.active || !snapshot.complete) {
      this.phase = 'deposit-wait-data';
      return POLL_MS;
    }

    if (this.pendingTransfer) {
      const currentInventory = Hive.inventory.getAll();
      const remaining = this.depositableCount(currentInventory, this.pendingTransfer.destinationContainer);
      if (remaining < this.pendingTransfer.remainingBefore) {
        const label = this.pendingTransfer.itemName || `item ${this.pendingTransfer.objectType}`;
        this.controller.appendActivity(`Deposited ${label} into ${this.pendingTransfer.destinationLabel}`);
        this.pendingTransfer = null;
        this.nextTransferAt = Date.now() + TRANSFER_SETTLE_MS;
        this.noDepositSince = 0;
        return POLL_MS;
      }
      if (Date.now() - this.pendingTransfer.startedAt < TRANSFER_TIMEOUT_MS) return POLL_MS;
      this.controller.appendActivity(`Deposit timed out for ${this.pendingTransfer.itemName || `item ${this.pendingTransfer.objectType}`}`);
      this.releaseDestination(this.pendingTransfer.destinationContainer, this.pendingTransfer.destinationSlot);
      this.pendingTransfer = null;
      this.nextTransferAt = Date.now() + TRANSFER_SETTLE_MS;
      this.noDepositSince = 0;
      return POLL_MS;
    }

    if (Date.now() < this.nextTransferAt) return POLL_MS;

    const liveInventory = Hive.inventory.getAll();
    const plan = this.nextDeposit(liveInventory, true);
    if (!plan) {
      const remainingTargets = this.depositableCount(liveInventory, 'potionVault')
        + (this.controller.state.storageDepositNonPotions
          ? this.depositableCount(liveInventory, 'vault')
          : 0);
      if (remainingTargets > 0) {
        this.noDepositSince = 0;
        this.controller.state.storageBlocked = true;
        this.activity = 'Wait For Storage';
        this.logBlocked('Waiting in Vault because requested items remain in inventory');
        return POLL_MS;
      }

      if (this.noDepositSince === 0) {
        this.noDepositSince = Date.now();
        return POLL_MS;
      }
      if (Date.now() - this.noDepositSince < NO_DEPOSIT_CONFIRM_MS) return POLL_MS;

      const remaining = this.carriedSlots(liveInventory);
      const stillFull = remaining.length > 0 && remaining.every(({ objectType }) => objectType >= 0);
      this.controller.state.storageBlocked = stillFull;
      if (stillFull) {
        this.controller.state.storageDepositRequested = true;
        this.logBlocked('Inventory remains full because the required storage is full');
        this.pendingTransfer = null;
      } else {
        this.finishDepositVisit();
      }
      this.phase = 'storage-return';
      this.activity = 'Return To Nexus';
      this.routeToNexus('Storage deposit complete; returning to Nexus', true);
      return POLL_MS;
    }

    this.noDepositSince = 0;
    this.controller.state.storageBlocked = false;
    this.lastBlockedMessage = '';

    Hive.walking.stopMoving();
    const accepted = Hive.inventory.swapContainers(
      { container: 'inventory', slotId: plan.source.slotIndex },
      { container: plan.destinationContainer, slotId: plan.destination.slotId },
    );
    if (!accepted) {
      this.controller.appendActivity(`Deposit command rejected for ${plan.itemName}`);
      return POLL_MS;
    }

    this.pendingTransfer = {
      inventorySlot: plan.source.slotIndex,
      objectType: plan.source.objectType,
      itemName: plan.itemName,
      destinationContainer: plan.destinationContainer,
      destinationSlot: plan.destination.slotId,
      destinationLabel: plan.destinationLabel,
      remainingBefore: this.depositableCount(liveInventory, plan.destinationContainer),
      startedAt: Date.now(),
    };
    this.reserveDestination(plan.destinationContainer, plan.destination.slotId);
    this.noDepositSince = 0;
    return POLL_MS;
  }

  nextDeposit(inventory, requireActiveContainers) {
    const carried = this.carriedSlots(inventory).filter(({ objectType }) => objectType >= 0);
    const potions = carried.filter(({ objectType }) => this.isStatPotion(objectType));
    const potionSlot = this.firstEmptyStorageSlot('potionVault', requireActiveContainers);
    if (potions.length && potionSlot) {
      const source = potions[0];
      return {
        source,
        destination: potionSlot,
        destinationContainer: 'potionVault',
        destinationLabel: 'potion storage',
        itemName: Hive.loot.getItemInfo(source.objectType)?.name || `potion ${source.objectType}`,
      };
    }

    if (!this.controller.state.storageDepositNonPotions) return null;
    const nonPotion = carried.find(({ objectType }) => !this.isStatPotion(objectType));
    const vaultSlot = this.firstEmptyStorageSlot('vault', requireActiveContainers);
    if (!nonPotion || !vaultSlot) return null;
    return {
      source: nonPotion,
      destination: vaultSlot,
      destinationContainer: 'vault',
      destinationLabel: 'Vault',
      itemName: Hive.loot.getItemInfo(nonPotion.objectType)?.name || `item ${nonPotion.objectType}`,
    };
  }

  carriedSlots(inventory) {
    const maximumSlot = carriedMaximumSlot();
    const result = [];
    for (let slotIndex = 4; slotIndex <= maximumSlot; slotIndex++) {
      result.push({ slotIndex, objectType: Number(inventory[slotIndex] ?? -1) });
    }
    return result;
  }

  depositableCount(inventory, destinationContainer) {
    const occupied = this.carriedSlots(inventory).filter(({ objectType }) => objectType >= 0);
    if (destinationContainer === 'potionVault') {
      return occupied.filter(({ objectType }) => this.isStatPotion(objectType)).length;
    }
    return occupied.filter(({ objectType }) => !this.isStatPotion(objectType)).length;
  }

  firstEmptyStorageSlot(container, requireActive) {
    const snapshot = this.vaultSnapshot();
    if (requireActive && !snapshot?.active) return null;
    const slots = Hive.inventory.getContainerSlots(container);
    this.releaseSynchronizedDestinations(container, slots);
    return slots.find((slot) => (
      slot.objectType < 0
      && !this.reservedDestinations.has(this.destinationKey(container, slot.slotId))
    )) ?? null;
  }

  destinationKey(container, slotId) {
    return `${container}:${slotId}`;
  }

  reserveDestination(container, slotId) {
    this.reservedDestinations.set(this.destinationKey(container, slotId), {
      container,
      slotId,
    });
  }

  releaseDestination(container, slotId) {
    this.reservedDestinations.delete(this.destinationKey(container, slotId));
  }

  releaseSynchronizedDestinations(container, slots) {
    for (const reservation of this.reservedDestinations.values()) {
      if (reservation.container !== container) continue;
      const slot = slots.find(({ slotId }) => slotId === reservation.slotId);
      if (slot?.objectType >= 0) this.releaseDestination(container, reservation.slotId);
    }
  }

  isStatPotion(objectType) {
    return potionStat(Hive.loot.getItemInfo(objectType)) !== null;
  }

  vaultSnapshot() {
    try {
      return Hive.inventory.getVaultSnapshot();
    } catch {
      return null;
    }
  }

  hasCompleteVaultSnapshot() {
    return this.vaultSnapshot()?.complete === true;
  }

  enterVault(message) {
    if (Date.now() - this.lastRouteCommandAt < ROUTE_RETRY_MS) return;
    this.lastRouteCommandAt = Date.now();
    Hive.walking.stopMoving();
    Hive.walking.enterVault();
    if (message) this.controller.appendActivity(message);
  }

  routeToNexus(message, force = false) {
    if (!force && Date.now() - this.lastRouteCommandAt < ROUTE_RETRY_MS) return;
    this.lastRouteCommandAt = Date.now();
    Hive.walking.stopMoving();
    Hive.walking.nexus();
    if (message) this.controller.appendActivity(message);
  }

  finishDepositVisit() {
    this.controller.state.storageDepositRequested = false;
    this.controller.state.storageDepositNonPotions = false;
    this.controller.state.storageBlocked = false;
    this.pendingTransfer = null;
    this.nextTransferAt = 0;
    this.noDepositSince = 0;
    this.reservedDestinations.clear();
    this.lastBlockedMessage = '';
  }

  logBlocked(message) {
    if (this.lastBlockedMessage === message) return;
    this.lastBlockedMessage = message;
    this.controller.appendActivity(message);
  }

  isRealmMap() {
    const name = Hive.world.getName().trim().toLowerCase();
    return name === 'realm' || name.includes('realm of the mad god');
  }
}
