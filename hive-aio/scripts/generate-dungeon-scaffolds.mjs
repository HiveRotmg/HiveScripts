/**
 * One-shot generator: scaffolds a folder per playable dungeon and rewrites the registry.
 * Run from hive-aio: node scripts/generate-dungeon-scaffolds.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dungeonsRoot = path.join(__dirname, '..', 'src', 'tree', 'dungeons');

/** Playable dungeons from objects.xml DungeonName (excludes nexus/vault/guild/test/arena/meta maps). */
const DUNGEONS = [
  { id: 'abyss-of-demons', name: 'Abyss of Demons', aliases: ['abyss of demons'] },
  { id: 'advanced-kogbold-steamworks', name: 'Advanced Kogbold Steamworks', aliases: ['advanced kogbold steamworks'] },
  { id: 'ancient-ruins', name: 'Ancient Ruins', aliases: ['ancient ruins'] },
  { id: 'battle-for-the-nexus', name: 'Battle for the Nexus', aliases: ['battle for the nexus'] },
  { id: 'belladonnas-garden', name: "Belladonna's Garden", aliases: ["belladonna's garden", 'belladonnas garden'] },
  { id: 'bilgewaters-grotto', name: "Bilgewater's Grotto", aliases: ["bilgewater's grotto", 'bilgewaters grotto'] },
  { id: 'candyland-hunting-grounds', name: 'Candyland Hunting Grounds', aliases: ['candyland hunting grounds'] },
  { id: 'cave-of-a-thousand-treasures', name: 'Cave of A Thousand Treasures', aliases: ['cave of a thousand treasures'] },
  { id: 'chicken-chamber', name: 'Chicken Chamber', aliases: ['chicken chamber'] },
  { id: 'cnidarian-reef', name: 'Cnidarian Reef', aliases: ['cnidarian reef'] },
  { id: 'consolation-of-draconis', name: 'Consolation of Draconis', aliases: ['consolation of draconis'] },
  { id: 'court-of-oryx', name: 'Court of Oryx', aliases: ['court of oryx'] },
  { id: 'crystal-cavern', name: 'Crystal Cavern', aliases: ['crystal cavern'] },
  { id: 'cultist-hideout', name: 'Cultist Hideout', aliases: ['cultist hideout'] },
  { id: 'cursed-library', name: 'Cursed Library', aliases: ['cursed library'] },
  { id: 'davy-jones-locker', name: "Davy Jones' Locker", aliases: ["davy jones' locker", 'davy jones locker'] },
  { id: 'deadwater-docks', name: 'Deadwater Docks', aliases: ['deadwater docks'] },
  { id: 'dreamscape-labyrinth', name: 'Dreamscape Labyrinth', aliases: ['dreamscape labyrinth'] },
  { id: 'exalted-kitchen', name: 'Exalted Kitchen', aliases: ['exalted kitchen'] },
  { id: 'forax', name: 'Forax', aliases: ['forax'] },
  { id: 'forbidden-jungle', name: 'Forbidden Jungle', aliases: ['forbidden jungle'] },
  { id: 'forest-maze', name: 'Forest Maze', aliases: ['forest maze'] },
  { id: 'fungal-cavern', name: 'Fungal Cavern', aliases: ['fungal cavern'] },
  {
    id: 'haunted-cemetery',
    name: 'Haunted Cemetery',
    aliases: [
      'haunted cemetery',
      'haunted cemetery gates',
      'haunted cemetery graves',
      'haunted cemetery final battle',
      'halloween haunted cemetery',
    ],
  },
  { id: 'heroic-undead-lair', name: 'Heroic Undead Lair', aliases: ['heroic undead lair'] },
  { id: 'hidden-interregnum', name: 'Hidden Interregnum', aliases: ['hidden interregnum'] },
  { id: 'high-tech-terror', name: 'High Tech Terror', aliases: ['high tech terror'] },
  { id: 'ice-cave', name: 'Ice Cave', aliases: ['ice cave'] },
  { id: 'ice-citadel', name: 'Ice Citadel', aliases: ['ice citadel'] },
  { id: 'ice-tomb', name: 'Ice Tomb', aliases: ['ice tomb'] },
  { id: 'infernal-abyss-of-demons', name: 'Infernal Abyss of Demons', aliases: ['infernal abyss of demons'] },
  { id: 'katalund', name: 'Katalund', aliases: ['katalund'] },
  { id: 'kitchen', name: 'Kitchen', aliases: ['kitchen'], exactAliases: true },
  { id: 'kogbold-steamworks', name: 'Kogbold Steamworks', aliases: ['kogbold steamworks'] },
  { id: 'lair-of-draconis', name: 'Lair of Draconis', aliases: ['lair of draconis', 'old lair of draconis'] },
  { id: 'lair-of-shaitan', name: 'Lair of Shaitan', aliases: ['lair of shaitan', 'old lair of shaitan'] },
  { id: 'legacy-heroic-abyss-of-demons', name: 'Legacy Heroic Abyss of Demons', aliases: ['legacy heroic abyss of demons'] },
  { id: 'legacy-heroic-undead-lair', name: 'Legacy Heroic Undead Lair', aliases: ['legacy heroic undead lair'] },
  { id: 'lost-halls', name: 'Lost Halls', aliases: ['lost halls'] },
  { id: 'mad-lab', name: 'Mad Lab', aliases: ['mad lab'] },
  { id: 'magic-woods', name: 'Magic Woods', aliases: ['magic woods'] },
  { id: 'malogia', name: 'Malogia', aliases: ['malogia'] },
  { id: 'manor-of-the-immortals', name: 'Manor of the Immortals', aliases: ['manor of the immortals'] },
  { id: 'moonlight-village', name: 'Moonlight Village', aliases: ['moonlight village'] },
  { id: 'mountain-temple', name: 'Mountain Temple', aliases: ['mountain temple'] },
  { id: 'neo-forax', name: 'Neo Forax', aliases: ['neo forax'] },
  { id: 'neo-katalund', name: 'Neo Katalund', aliases: ['neo katalund'] },
  { id: 'neo-malogia', name: 'Neo Malogia', aliases: ['neo malogia'] },
  { id: 'neo-untaris', name: 'Neo Untaris', aliases: ['neo untaris'] },
  { id: 'ocean-trench', name: 'Ocean Trench', aliases: ['ocean trench'] },
  { id: 'oryxs-castle', name: "Oryx's Castle", aliases: ["oryx's castle", 'oryxs castle'] },
  { id: 'oryxs-chamber', name: "Oryx's Chamber", aliases: ["oryx's chamber", 'oryxs chamber'] },
  { id: 'oryxs-sanctuary', name: "Oryx's Sanctuary", aliases: ["oryx's sanctuary", 'oryxs sanctuary'] },
  { id: 'parasite-chambers', name: 'Parasite Chambers', aliases: ['parasite chambers'] },
  { id: 'pirate-cave', name: 'Pirate Cave', aliases: ['pirate cave'] },
  { id: 'plagued-nest', name: 'Plagued Nest', aliases: ['plagued nest', 'the nest'] },
  { id: 'puppet-masters-encore', name: "Puppet Master's Encore", aliases: ["puppet master's encore", 'puppet masters encore'] },
  { id: 'puppet-masters-theatre', name: "Puppet Master's Theatre", aliases: ["puppet master's theatre", 'puppet masters theatre'] },
  { id: 'queen-bunny-chamber', name: 'Queen Bunny Chamber', aliases: ['queen bunny chamber'] },
  { id: 'remnant-of-the-void', name: 'Remnant of the Void', aliases: ['remnant of the void'] },
  { id: 'santa-workshop', name: 'Santa Workshop', aliases: ['santa workshop'] },
  { id: 'secluded-thicket', name: 'Secluded Thicket', aliases: ['secluded thicket'] },
  { id: 'snake-pit', name: 'Snake Pit', aliases: ['snake pit'] },
  { id: 'spectral-penitentiary', name: 'Spectral Penitentiary', aliases: ['spectral penitentiary'] },
  { id: 'spider-den', name: 'Spider Den', aliases: ['spider den'] },
  { id: 'sprite-world', name: 'Sprite World', aliases: ['sprite world'] },
  { id: 'stromwells-rift-i', name: "Stromwell's Rift I", aliases: ["stromwell's rift i", 'stromwells rift i'] },
  { id: 'stromwells-rift-ii', name: "Stromwell's Rift II", aliases: ["stromwell's rift ii", 'stromwells rift ii'] },
  { id: 'stromwells-rift-iii', name: "Stromwell's Rift III", aliases: ["stromwell's rift iii", 'stromwells rift iii'] },
  { id: 'sulfurous-wetlands', name: 'Sulfurous Wetlands', aliases: ['sulfurous wetlands'] },
  { id: 'the-crawling-depths', name: 'The Crawling Depths', aliases: ['the crawling depths', 'crawling depths'] },
  { id: 'the-hive', name: 'The Hive', aliases: ['the hive'] },
  { id: 'the-inner-sanctum', name: 'The Inner Sanctum', aliases: ['the inner sanctum', 'inner sanctum'] },
  { id: 'the-inner-workings', name: 'The Inner Workings', aliases: ['the inner workings', 'inner workings'] },
  { id: 'the-machine', name: 'The Machine', aliases: ['the machine'] },
  { id: 'the-shatters', name: 'The Shatters', aliases: ['the shatters', 'shatters'] },
  { id: 'the-tavern', name: 'The Tavern', aliases: ['the tavern', 'tavern'] },
  { id: 'the-third-dimension', name: 'The Third Dimension', aliases: ['the third dimension', 'third dimension'] },
  { id: 'the-void', name: 'The Void', aliases: ['the void'] },
  { id: 'tomb-of-the-ancients', name: 'Tomb of the Ancients', aliases: ['tomb of the ancients'] },
  { id: 'tomb-of-the-ancients-heroic', name: 'Tomb of the Ancients (Heroic)', aliases: ['tomb of the ancients (heroic)'] },
  { id: 'toxic-sewers', name: 'Toxic Sewers', aliases: ['toxic sewers'] },
  { id: 'undead-lair', name: 'Undead Lair', aliases: ['undead lair'] },
  { id: 'untaris', name: 'Untaris', aliases: ['untaris'] },
  { id: 'wine-cellar', name: 'Wine Cellar', aliases: ['wine cellar', 'wine cellar short'] },
  { id: 'woodland-labyrinth', name: 'Woodland Labyrinth', aliases: ['woodland labyrinth'] },
];

function toPascalCase(id) {
  return id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

function scaffoldDungeon(dungeon) {
  const dir = path.join(dungeonsRoot, dungeon.id);
  const pascal = toPascalCase(dungeon.id);
  const branchClass = `${pascal}Branch`;
  const isMapFn = `is${pascal}Map`;
  const aliasLiteral = JSON.stringify(dungeon.aliases, null, 2);
  const branchPath = path.join(dir, `${branchClass}.mjs`);
  const preserveCustomBranch = dungeon.id === 'oryxs-castle' && fs.existsSync(branchPath);


  writeFile(path.join(dir, 'map.mjs'), `import { Hive } from '@hive/sdk';

const MAP_ALIASES = ${aliasLiteral};

export function ${isMapFn}() {
  const name = String(Hive.world.getName?.() ?? '').trim().toLowerCase().replaceAll('\\u2019', "'");
  ${dungeon.exactAliases
    ? 'return MAP_ALIASES.some((alias) => name === alias);'
    : 'return MAP_ALIASES.some((alias) => name === alias || name.includes(alias));'}
}
`);

  writeFile(path.join(dir, 'route.mjs'), `/** ${dungeon.name} constants — expand as the solver is filled in. */
export const PORTAL_TYPES = Object.freeze([]);
export const BOSS_TYPES = Object.freeze([]);
`);

  writeFile(path.join(dir, 'rooms', 'AwaitLogicLeaf.mjs'), `import { Leaf } from '@hive/sdk';
import { TIMING } from '../../../../config/constants.mjs';

/**
 * Fallback while ${dungeon.name} room logic is unfinished.
 * Keeps the dungeon branch valid so OtherMap does not steal the map.
 */
export class AwaitLogicLeaf extends Leaf {
  constructor(controller) {
    super(${JSON.stringify(`Await ${dungeon.name} Logic`)});
    this.controller = controller;
  }

  isValid() {
    return true;
  }

  onLoop() {
    this.controller.appendActivity?.(${JSON.stringify(`Dungeon: in ${dungeon.name} (solver pending)`)});
    return TIMING.placeholderPollMs;
  }
}
`);

  if (!preserveCustomBranch) {
    writeFile(path.join(dir, `${branchClass}.mjs`), `import { Branch } from '@hive/sdk';
import { ${isMapFn} } from './map.mjs';
import { AwaitLogicLeaf } from './rooms/AwaitLogicLeaf.mjs';

/**
 * Reusable ${dungeon.name} solver.
 * Activated by map detection only — not by wantedDungeon intent.
 */
export class ${branchClass} extends Branch {
  constructor(controller) {
    super(${JSON.stringify(dungeon.name)});
    this.controller = controller;
    this.addLeaves(new AwaitLogicLeaf(controller));
  }

  isValid() {
    return this.controller.state.automationRunning && ${isMapFn}();
  }

  reset() {
    // Room progress hooks go here as the solver is filled in.
  }
}
`);
  }
  writeFile(path.join(dir, 'index.mjs'), `import { ${branchClass} } from './${branchClass}.mjs';
import { ${isMapFn} } from './map.mjs';
import { BOSS_TYPES, PORTAL_TYPES } from './route.mjs';

export default {
  id: ${JSON.stringify(dungeon.id)},
  name: ${JSON.stringify(dungeon.name)},
  portalTypes: PORTAL_TYPES,
  bossTypes: BOSS_TYPES,
  isMap: ${isMapFn},
  createBranch(controller) {
    return new ${branchClass}(controller);
  },
};
`);
}

function writeRegistry(dungeons) {
  const imports = dungeons.map((dungeon, index) => {
    const varName = toPascalCase(dungeon.id).replace(/^./, (c) => c.toLowerCase());
    // ensure valid identifier: exaltedKitchen style
    const safe = dungeon.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return { dungeon, varName: safe, index };
  });

  const importLines = imports.map(({ dungeon, varName }) => (
    `import ${varName} from './${dungeon.id}/index.mjs';`
  )).join('\n');

  const listLines = imports.map(({ varName }) => `  ${varName},`).join('\n');

  writeFile(path.join(dungeonsRoot, 'index.mjs'), `${importLines}

/** Registered dungeon solver definitions. Add new dungeons here. */
export const dungeonDefinitions = [
${listLines}
];

/** Derived from the current map — never manually mutated as farming intent. */
export function resolveCurrentDungeonId() {
  return dungeonDefinitions.find((definition) => definition.isMap())?.id ?? null;
}

export function resolveCurrentDungeon() {
  return dungeonDefinitions.find((definition) => definition.isMap()) ?? null;
}

export function isAnyDungeonMap() {
  return resolveCurrentDungeonId() !== null;
}
`);

  writeFile(path.join(dungeonsRoot, 'dungeon-catalog.mjs'), `/** Auto-generated catalog of scaffolded dungeon ids/names. */
export const DUNGEON_CATALOG = Object.freeze(${JSON.stringify(DUNGEONS.map(({ id, name }) => ({ id, name })), null, 2)});
`);
}

function removeShared() {
  const shared = path.join(dungeonsRoot, 'shared');
  if (!fs.existsSync(shared)) return;
  fs.rmSync(shared, { recursive: true, force: true });
}

removeShared();
for (const dungeon of DUNGEONS) {
  scaffoldDungeon(dungeon);
}
writeRegistry(DUNGEONS);
console.log(`Scaffolded ${DUNGEONS.length} dungeons under ${dungeonsRoot}`);
