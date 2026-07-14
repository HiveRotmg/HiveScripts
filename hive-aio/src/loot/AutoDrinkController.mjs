import { Hive } from '@hive/sdk';
import { pathfindingWalkTo } from '../movement/pathfinding.mjs?rev=autodrink-20260714';

const ACTION_DELAY_MS = 200;
const ACTION_TIMEOUT_MS = 6000;
const RETRY_DELAY_MS = 3000;

const POTION_STATS = Object.freeze({
  attack: { key: 'attack', label: 'Attack' },
  defense: { key: 'defense', label: 'Defense' },
  speed: { key: 'speed', label: 'Speed' },
  vitality: { key: 'vitality', label: 'Vitality' },
  wisdom: { key: 'wisdom', label: 'Wisdom' },
  dexterity: { key: 'dexterity', label: 'Dexterity' },
  life: { key: 'maxHP', label: 'Life' },
  mana: { key: 'maxMP', label: 'Mana' },
});

export function potionStat(item) {
  const match = /^(?:greater )?potion of (attack|defense|speed|vitality|wisdom|dexterity|life|mana)(?: \(sb\))?$/i
    .exec(String(item?.name ?? '').trim());
  return match ? POTION_STATS[match[1].toLowerCase()] ?? null : null;
}

function itemKey(bagObjectId, slotIndex) {
  return `${bagObjectId}:${slotIndex}`;
}

export class AutoDrinkController {
  constructor(controller) {
    this.controller = controller;
    this.active = null;
    this.blockedUntil = new Map();
  }

  reset() {
    this.active = null;
    this.blockedUntil.clear();
  }

  onLoop() {
    const { state } = this.controller;
    if (!state.automationRunning || (!state.autoDrinkEnabled && !state.pickupPotionsEnabled)) {
      this.active = null;
      return null;
    }
    if (this.active) return this.continueActive();

    const plan = this.findPlan();
    if (!plan) return null;

    Hive.walking.stopMoving();
    this.controller.autoLoot?.reset();
    this.active = { ...plan, phase: 'approach', startedAt: Date.now() };
    return this.continueActive();
  }

  findPlan() {
    const now = Date.now();
    for (const [key, until] of this.blockedUntil) {
      if (until <= now) this.blockedUntil.delete(key);
    }

    const base = Hive.self.getBaseStats();
    const caps = Hive.self.getStatCaps();
    const destinationSlot = this.firstEmptyInventorySlot();
    const candidates = [];
    for (const bag of Hive.loot.getBags()) {
      const distance = Hive.self.distanceTo(bag.position);
      for (const item of bag.items) {
        const key = itemKey(bag.objectId, item.slotIndex);
        if ((this.blockedUntil.get(key) ?? 0) > now) continue;
        const info = Hive.loot.getItemInfo(item.objectType);
        const stat = potionStat(info);
        if (!stat) continue;
        const needsStat = this.needsStat(base, caps, stat.key);
        const mode = this.controller.state.autoDrinkEnabled && needsStat
          ? 'drink'
          : this.controller.state.pickupPotionsEnabled && destinationSlot !== null
            ? 'pickup'
            : null;
        if (!mode) continue;
        candidates.push({ bag, item, info, stat, distance, mode, destinationSlot });
      }
    }

    candidates.sort((left, right) => (left.mode === 'drink' ? 0 : 1) - (right.mode === 'drink' ? 0 : 1)
      || left.distance - right.distance
      || left.item.slotIndex - right.item.slotIndex);
    return candidates[0] ?? null;
  }

  continueActive() {
    const action = this.active;
    const liveBag = Hive.loot.getBags().find((bag) => bag.objectId === action.bag.objectId);
    const liveItem = liveBag?.items.find((item) =>
      item.slotIndex === action.item.slotIndex && item.objectType === action.item.objectType);
    const base = Hive.self.getBaseStats();
    const caps = Hive.self.getStatCaps();
    const inventory = Hive.inventory.getAll();

    if (action.mode === 'pickup' && inventory[action.destinationSlot] === action.item.objectType) {
      this.finish(action, `Picked up ${action.info?.name ?? `${action.stat.label} potion`}`);
      return ACTION_DELAY_MS;
    }

    if (action.mode === 'drink' && !this.needsStat(base, caps, action.stat.key)) {
      const destinationSlot = this.controller.state.pickupPotionsEnabled
        ? this.firstEmptyInventorySlot(inventory)
        : null;
      if (action.phase !== 'wait-consume' && liveBag && liveItem && destinationSlot !== null) {
        action.mode = 'pickup';
        action.destinationSlot = destinationSlot;
        action.phase = 'approach';
        action.startedAt = Date.now();
      } else {
        this.finish(action, action.phase === 'wait-consume'
          ? `Drank ${action.info?.name ?? `${action.stat.label} potion`}`
          : `${action.stat.label} is maxed`);
        return ACTION_DELAY_MS;
      }
    }
    if (!liveBag || !liveItem) {
      if (action.phase === 'wait-consume') {
        this.finish(action, `Drank ${action.info?.name ?? `${action.stat.label} potion`}`);
      } else if (action.phase === 'wait-pickup' && Date.now() - action.startedAt < ACTION_TIMEOUT_MS) {
        return ACTION_DELAY_MS;
      } else {
        this.block(action, 'potion disappeared');
      }
      return ACTION_DELAY_MS;
    }
    action.bag = liveBag;
    action.item = liveItem;

    if (action.phase === 'approach') {
      if (Hive.self.distanceTo(liveBag.position) > 1) {
        pathfindingWalkTo(this.controller, liveBag.position.x, liveBag.position.y);
      } else {
        Hive.walking.stopMoving();
        const accepted = action.mode === 'drink'
          ? Hive.loot.useFromBag(liveBag, liveItem.slotIndex)
          : Hive.loot.pickupToSlot(liveBag, liveItem.slotIndex, action.destinationSlot);
        if (!accepted) {
          this.block(action, `${action.mode} command was rejected`);
          return ACTION_DELAY_MS;
        }
        action.phase = action.mode === 'drink' ? 'wait-consume' : 'wait-pickup';
        action.startedAt = Date.now();
        if (action.mode === 'drink') action.startingValue = Number(base[action.stat.key]) || 0;
      }
    } else if (action.phase === 'wait-consume' && (Number(base[action.stat.key]) || 0) > action.startingValue) {
      this.finish(action, `Drank ${action.info?.name ?? `${action.stat.label} potion`}`);
      return ACTION_DELAY_MS;
    }

    if (Date.now() - action.startedAt >= ACTION_TIMEOUT_MS) {
      this.block(action, `${action.mode} confirmation timed out`);
    }
    return ACTION_DELAY_MS;
  }

  needsStat(base, caps, key) {
    const current = Number(base?.[key]);
    const cap = Number(caps?.[key]);
    return Number.isFinite(current) && Number.isFinite(cap) && cap > 0 && current < cap;
  }

  firstEmptyInventorySlot(inventory = Hive.inventory.getAll()) {
    const backpack = Number(Hive.inventory.getBackpack()) || 1;
    const maximumSlot = backpack >= 3 ? 27 : backpack >= 2 ? 19 : 11;
    for (let slotIndex = 4; slotIndex <= maximumSlot; slotIndex++) {
      if ((inventory[slotIndex] ?? -1) < 0) return slotIndex;
    }
    return null;
  }

  finish(action, message) {
    this.blockedUntil.set(
      itemKey(action.bag.objectId, action.item.slotIndex),
      Date.now() + RETRY_DELAY_MS,
    );
    this.active = null;
    if (message) this.controller.appendActivity(message);
  }

  block(action, reason) {
    this.blockedUntil.set(
      itemKey(action.bag.objectId, action.item.slotIndex),
      Date.now() + RETRY_DELAY_MS,
    );
    this.active = null;
    if (reason) this.controller.appendActivity(`Stat potion skipped: ${reason}`);
  }
}
