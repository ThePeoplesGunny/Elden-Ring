// Phase A.3: extract engine functions from legacy Tarnished_Companion_v3.9.html
// into tc_next/engine/legacy_bundle.js — a 1:1 port that reads data from the
// JSON files we extracted in A.2. No logic changes; guarantees parity.
//
// Run: node scripts/phase_a_extract_engine.js

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const HTML = path.join(REPO, 'Tarnished_Companion_v3.9.html');
const OUT_DIR = path.join(REPO, 'tc_next', 'engine');
const OUT = path.join(OUT_DIR, 'legacy_bundle.js');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Stub browser globals so the legacy script evals cleanly in node.
global.React = {
  useState: (i) => [typeof i === 'function' ? i() : i, () => {}],
  useEffect: () => {},
  createElement: () => null,
};
global.ReactDOM = { render: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = {
  getElementById: () => ({}),
  createElement: () => ({ href: '', download: '', click: () => {}, style: {} }),
  body: { appendChild: () => {}, removeChild: () => {} },
};
global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
global.Blob = function () {};
global.FileReader = function () { this.readAsText = () => {}; };
global.confirm = () => false;
global.setTimeout = (fn) => fn();
global.performance = { now: () => Date.now() };

const html = fs.readFileSync(HTML, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('inline <script> not found');
eval.call(global, scriptMatch[1]);

// Named functions to extract (from project doc file map + helpers). Each will
// be serialized via Function.prototype.toString so the module source matches
// the legacy source exactly.
const FUNCS = [
  // Rune cost
  'runeCostForLevel', 'levelsFromRunes', 'totalRunesForLevels',
  // Weapon decode + AR
  'engDecodeW', 'engDecodeWAtLevel', 'engCalcAR',
  'engStatusUpgradeMult',
  // Derived stats
  'engHP', 'engFP', 'engStam', 'engEquip',
  'calcHP', 'calcFP', 'calcStam', 'calcEquip', // aliases if present
  // Damage
  'engDefenseMult', 'engDmgVsBoss', 'engSpellDmgVsBoss', 'engStatusVsBoss',
  // Poise/stagger
  'getBossPoiseInfo',
  // Spells / buffs / ashes
  'availableSpells', 'availableBuffs', 'bestAshOfWar',
  // Talismans
  'computeTalismanBonus',
  // Requirements + optimizer
  'meetsRequirements', 'globalOptimize', 'bestWeaponForBoss',
  'computeStatCostToEquip', 'vigFloorForBoss', 'optimizeStats',
  'computeWeaponValue', 'evaluateChoices', 'rankActions',
  // Archetype / progression
  'resolveStats', 'filterArchPool', 'isBuildRelevant',
  'computeProgressionCurve', 'bestCatalystAtCheckpoint',
  'getPlayerBossDmg',
  // Gate / journey
  'deriveGateState', 'getNextMandatoryBoss',
  'resolveTacticalNeeds', 'getEnemyResistWarning',
  // Endings
  'endingAvailability',
  // Internal helpers
  'sk', '_dsLookup', 'evalCCGraph',
];

const captured = [];
const missing = [];
for (const name of FUNCS) {
  const fn = global[name];
  if (typeof fn === 'function') {
    captured.push({ name, src: fn.toString() });
  } else {
    missing.push(name);
  }
}

// Data manifest — mirrors the files produced by phase_a_extract_data.js.
const DATA_MANIFEST = [
  ['ENG_DATA',            'eng_data.json'],
  ['BASE_REGIONS',        'regions_base.json'],
  ['DLC_REGIONS',         'regions_dlc.json'],
  ['MANDATORY_BOSSES',    'mandatory_bosses.json'],
  ['REGION_CAPS',         'region_caps.json'],
  ['GATE_WHETSTONES',     'gate_whetstones.json'],
  ['GATE_BELL_BEARINGS',  'gate_bell_bearings.json'],
  ['BOSS_READY',          'boss_ready.json'],
  ['STAT_TEMPLATES',      'stat_templates.json'],
  ['CLASSES',             'classes.json'],
  ['SOFT_CAPS',           'soft_caps.json'],
  ['STAT_NAMES',          'stat_names.json'],
  ['STAT_LABELS',         'stat_labels.json'],
  ['STAT_DESC',           'stat_desc.json'],
  ['WRETCH',              'wretch.json'],
  ['WRETCH_BASE_TOTAL',   'wretch_base_total.json'],
  ['WRETCH_LEVEL',        'wretch_level.json'],
  ['ENG_GRAPHS',          'eng_graphs.json'],
  ['PHYS_SUBTYPE',        'phys_subtype.json'],
  ['AMMO_DATA',           'ammo_data.json'],
  ['SPELL_DMG',           'spell_dmg.json'],
  ['SPELL_STEP',          'spell_step.json'],
  ['CASTER_LOADOUT',      'caster_loadout.json'],
  ['TALISMAN_LOADOUT',    'talisman_loadout.json'],
  ['ASHES_OF_WAR',        'ashes_of_war.json'],
  ['WEAPON_BUFFS',        'weapon_buffs.json'],
  ['DLC_WEAPONS',         'dlc_weapons.json'],
  ['WEAPON_STEPS',        'weapon_steps.json'],
  ['FARM_TARGETS',        'farm_targets.json'],
  ['ENEMY_RESIST',        'enemy_resist.json'],
  ['STAGGER_TIER',        'stagger_tier.json'],
  ['STAGGER_LABELS',      'stagger_labels.json'],
  ['STATUS_TYPES',        'status_types.json'],
  ['STATUS_PROC_DAMAGE',  'status_proc_damage.json'],
  ['STEP_CLASS',          'step_class.json'],
  ['CLASS_LABELS',        'class_labels.json'],
  ['STEP_ITEMS',          'step_items.json'],
  ['TACTICAL_NEEDS',      'tactical_needs.json'],
  ['ACHIEVEMENTS',        'achievements.json'],
  ['ENDING_DATA',         'ending_data.json'],
  ['QUESTS',              'quests.json'],
  ['ENDINGS',             'endings.json'],
  ['ENG_WEAPON_NAMES',    'eng_weapon_names.json'],
  ['WEAPON_INDEX',        'weapon_index.json'],
  ['ENG_AFFINITY_NAMES',  'eng_affinity_names.json'],
  ['ENG_DMG_NAMES',       'eng_dmg_names.json'],
  ['ENG_DMG_COLORS',      'eng_dmg_colors.json'],
  ['ENG_BOSS_LIST',       'eng_boss_list.json'],
  ['BOSS_ENG_MAP',        'boss_eng_map.json'],
  ['BOSSES_BASE',         'bosses_base.json'],
  ['BOSSES_DLC',          'bosses_dlc.json'],
  ['SCALE_MULT',          'scale_mult.json'],
  ['AMMO_ARROWS',         'ammo_arrows.json'],
  ['AMMO_BOLTS',          'ammo_bolts.json'],
  ['AMMO_GREAT_ARROWS',   'ammo_great_arrows.json'],
  ['AMMO_GREAT_BOLTS',    'ammo_great_bolts.json'],
  ['AMMO_FOR_WEAPON',     'ammo_for_weapon.json'],
  ['STAGGER_COLORS',      'stagger_colors.json'],
  ['STATUS_NAMES',        'status_names.json'],
  ['STATUS_COLORS',       'status_colors.json'],
  ['CLASS_COLORS',        'class_colors.json'],
  ['CLASS_DESCS',         'class_descs.json'],
  ['CATEGORIES',          'categories.json'],
  ['DASH_CATS',           'dash_cats.json'],
];

// Derived stat key index — legacy built this via an IIFE from ENG_DATA curves.
// We serialize the already-populated object from the live eval instead.
const dsKeys = global._dsKeys || null;

const outParts = [];
outParts.push(`// tc_next/engine/legacy_bundle.js — auto-generated by scripts/phase_a_extract_engine.js`);
outParts.push(`// Phase A.3 extraction: 1:1 port of legacy engine functions. No logic changes.`);
outParts.push(`// Source of truth: Tarnished_Companion_v3.9.html lines ~2004-3957.`);
outParts.push(`// Data is loaded from sibling tc_next/data/*.json files.`);
outParts.push(`// Do NOT hand-edit — regenerate via the extraction script.`);
outParts.push(``);

outParts.push(`'use strict';`);
outParts.push(`const fs = require('fs');`);
outParts.push(`const path = require('path');`);
outParts.push(`const DATA_DIR = path.join(__dirname, '..', 'data');`);
outParts.push(`function D(f) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); }`);
outParts.push(``);

outParts.push(`// ---- Data constants (loaded synchronously at module init) ----`);
for (const [name, file] of DATA_MANIFEST) {
  outParts.push(`const ${name} = D(${JSON.stringify(file)});`);
}
outParts.push(``);

outParts.push(`// ---- Derived-stat key index (pre-computed in legacy IIFE) ----`);
outParts.push(`const _dsKeys = ${JSON.stringify(dsKeys)};`);
outParts.push(``);

outParts.push(`// ---- Engine functions (verbatim from legacy HTML) ----`);
for (const { name, src } of captured) {
  outParts.push(src);
  outParts.push('');
}

outParts.push(`// ---- Module exports ----`);
outParts.push(`module.exports = {`);
for (const { name } of captured) {
  outParts.push(`  ${name},`);
}
// Export data constants for any module that needs them
for (const [name] of DATA_MANIFEST) {
  outParts.push(`  ${name},`);
}
outParts.push(`  _dsKeys,`);
outParts.push(`};`);
outParts.push(``);

fs.writeFileSync(OUT, outParts.join('\n'));

console.log(`Wrote ${OUT}`);
console.log(`  captured ${captured.length} functions:`);
for (const { name, src } of captured) {
  const lines = src.split('\n').length;
  console.log(`    ${name}  (${lines} lines)`);
}
if (missing.length) {
  console.log(`  missing (not found as global functions): ${missing.join(', ')}`);
}
const stat = fs.statSync(OUT);
console.log(`  file size: ${(stat.size / 1024).toFixed(1)} KB`);
