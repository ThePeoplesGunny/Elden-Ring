// Phase A.2: extract inline JSON data from legacy Tarnished_Companion_v3.9.html
// into separate JSON files under tc_next/data/.
//
// Uses the same eval() pattern the calibration scripts use — we never load the
// raw inline block into context; we just let node execute it and serialize the
// resulting globals to disk.
//
// Run: node scripts/phase_a_extract_data.js

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const HTML = path.join(REPO, 'Tarnished_Companion_v3.9.html');
const OUT = path.join(REPO, 'tc_next', 'data');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Stub the browser globals the legacy script touches during eval.
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

// Execute the legacy script so its top-level constants become globals on
// globalThis. We don't read or print the raw source — just extract the named
// constants we care about.
eval.call(global, scriptMatch[1]);

// Manifest of constants to extract and their target filenames.
// Each entry: { globalName, file, describe? }
const EXTRACT = [
  // Top-level data container
  { name: 'ENG_DATA',              file: 'eng_data.json' },

  // Region + boss rosters
  { name: 'BASE_REGIONS',          file: 'regions_base.json' },
  { name: 'DLC_REGIONS',           file: 'regions_dlc.json' },
  { name: 'MANDATORY_BOSSES',      file: 'mandatory_bosses.json' },

  // Gates / caps
  { name: 'REGION_CAPS',           file: 'region_caps.json' },
  { name: 'GATE_WHETSTONES',       file: 'gate_whetstones.json' },
  { name: 'GATE_BELL_BEARINGS',    file: 'gate_bell_bearings.json' },
  { name: 'BOSS_READY',            file: 'boss_ready.json' },

  // Archetype + stat templates
  { name: 'STAT_TEMPLATES',        file: 'stat_templates.json' },
  { name: 'CLASSES',               file: 'classes.json' },
  { name: 'SOFT_CAPS',             file: 'soft_caps.json' },
  { name: 'STAT_NAMES',            file: 'stat_names.json' },
  { name: 'STAT_LABELS',           file: 'stat_labels.json' },
  { name: 'STAT_DESC',             file: 'stat_desc.json' },

  // Wretch constants (used by engine init)
  { name: 'WRETCH',                file: 'wretch.json' },
  { name: 'WRETCH_BASE_TOTAL',     file: 'wretch_base_total.json' },
  { name: 'WRETCH_LEVEL',          file: 'wretch_level.json' },

  // Engine auxiliary data
  { name: 'ENG_GRAPHS',            file: 'eng_graphs.json' },
  { name: 'PHYS_SUBTYPE',          file: 'phys_subtype.json' },
  { name: 'AMMO_DATA',             file: 'ammo_data.json' },
  { name: 'SPELL_DMG',             file: 'spell_dmg.json' },
  { name: 'SPELL_STEP',            file: 'spell_step.json' },
  { name: 'CASTER_LOADOUT',        file: 'caster_loadout.json' },
  { name: 'TALISMAN_LOADOUT',      file: 'talisman_loadout.json' },
  { name: 'ASHES_OF_WAR',          file: 'ashes_of_war.json' },
  { name: 'WEAPON_BUFFS',          file: 'weapon_buffs.json' },
  { name: 'DLC_WEAPONS',           file: 'dlc_weapons.json' },
  { name: 'WEAPON_STEPS',          file: 'weapon_steps.json' },
  { name: 'FARM_TARGETS',          file: 'farm_targets.json' },
  { name: 'ENEMY_RESIST',          file: 'enemy_resist.json' },
  { name: 'STAGGER_TIER',          file: 'stagger_tier.json' },
  { name: 'STAGGER_LABELS',        file: 'stagger_labels.json' },
  { name: 'STATUS_TYPES',          file: 'status_types.json' },
  { name: 'STATUS_PROC_DAMAGE',    file: 'status_proc_damage.json' },

  // Walkthrough / tactical
  { name: 'STEP_CLASS',            file: 'step_class.json' },
  { name: 'CLASS_LABELS',          file: 'class_labels.json' },
  { name: 'STEP_ITEMS',            file: 'step_items.json' },
  { name: 'TACTICAL_NEEDS',        file: 'tactical_needs.json' },

  // Endings / achievements / quests
  { name: 'ACHIEVEMENTS',          file: 'achievements.json' },
  { name: 'ENDING_DATA',           file: 'ending_data.json' },
  { name: 'QUESTS',                file: 'quests.json' },
  { name: 'ENDINGS',               file: 'endings.json' },

  // Engine auxiliary lookup tables (referenced by engine functions)
  { name: 'ENG_WEAPON_NAMES',      file: 'eng_weapon_names.json' },
  { name: 'WEAPON_INDEX',          file: 'weapon_index.json' },
  { name: 'ENG_AFFINITY_NAMES',    file: 'eng_affinity_names.json' },
  { name: 'ENG_DMG_NAMES',         file: 'eng_dmg_names.json' },
  { name: 'ENG_DMG_COLORS',        file: 'eng_dmg_colors.json' },
  { name: 'ENG_BOSS_LIST',         file: 'eng_boss_list.json' },
  { name: 'BOSS_ENG_MAP',          file: 'boss_eng_map.json' },
  { name: 'BOSSES_BASE',           file: 'bosses_base.json' },
  { name: 'BOSSES_DLC',            file: 'bosses_dlc.json' },
  { name: 'SCALE_MULT',            file: 'scale_mult.json' },

  // Ammunition
  { name: 'AMMO_ARROWS',           file: 'ammo_arrows.json' },
  { name: 'AMMO_BOLTS',            file: 'ammo_bolts.json' },
  { name: 'AMMO_GREAT_ARROWS',     file: 'ammo_great_arrows.json' },
  { name: 'AMMO_GREAT_BOLTS',      file: 'ammo_great_bolts.json' },
  { name: 'AMMO_FOR_WEAPON',       file: 'ammo_for_weapon.json' },

  // UI-adjacent but referenced by engine/UI helpers
  { name: 'STAGGER_COLORS',        file: 'stagger_colors.json' },
  { name: 'STATUS_NAMES',          file: 'status_names.json' },
  { name: 'STATUS_COLORS',         file: 'status_colors.json' },
  { name: 'CLASS_COLORS',          file: 'class_colors.json' },
  { name: 'CLASS_DESCS',           file: 'class_descs.json' },
  { name: 'CATEGORIES',            file: 'categories.json' },
  { name: 'DASH_CATS',             file: 'dash_cats.json' },
];

const summary = [];
for (const { name, file } of EXTRACT) {
  const val = global[name];
  if (typeof val === 'undefined') {
    console.warn(`SKIP: ${name} is undefined`);
    continue;
  }
  const target = path.join(OUT, file);
  fs.writeFileSync(target, JSON.stringify(val, null, 0));
  const size = fs.statSync(target).size;
  summary.push({ name, file, bytes: size });
}

// Second-level split: ENG_DATA has weapons/bosses/armor/etc. nested. Promote
// each to its own file for easier Phase B merging.
const engData = global.ENG_DATA || {};
const NESTED = [
  { path: ['reg', 'w'],      file: 'weapons_encoded.json',       describe: 'all affinity variants encoded (~2,764 entries)' },
  { path: ['reg', 'rt'],     file: 'reinforcement_tables.json',  describe: 'smithing stone upgrade tables' },
  { path: ['bosses'],        file: 'bosses_engine.json',         describe: 'boss HP/def/negation/status/poise (engine-verified)' },
  { path: ['armor'],         file: 'armor_engine.json',          describe: 'curated armor sets (engine subset)' },
  { path: ['sorceries'],     file: 'sorceries_engine.json',      describe: 'sorceries (engine subset)' },
  { path: ['incantations'],  file: 'incantations_engine.json',   describe: 'incantations (engine subset)' },
  { path: ['talismans'],     file: 'talismans_engine.json',      describe: 'talismans (engine subset)' },
  { path: ['derivedStats'],  file: 'derived_stats.json',         describe: 'HP/FP/Stam/EquipLoad/Discovery curves (Fextralife-verified)' },
];

for (const { path: p, file } of NESTED) {
  let v = engData;
  for (const k of p) {
    if (v == null) { v = undefined; break; }
    v = v[k];
  }
  if (typeof v === 'undefined') {
    console.warn(`SKIP (nested): ENG_DATA.${p.join('.')} is undefined`);
    continue;
  }
  const target = path.join(OUT, file);
  fs.writeFileSync(target, JSON.stringify(v, null, 0));
  const size = fs.statSync(target).size;
  summary.push({ name: 'ENG_DATA.' + p.join('.'), file, bytes: size });
}

// Sort by size for the log
summary.sort((a, b) => b.bytes - a.bytes);
const totalBytes = summary.reduce((s, r) => s + r.bytes, 0);

console.log('\nextraction summary:');
for (const { name, file, bytes } of summary) {
  const kb = (bytes / 1024).toFixed(1).padStart(8);
  console.log(`  ${kb} KB  ${file.padEnd(30)}  <- ${name}`);
}
console.log(`\n  total: ${(totalBytes / 1024).toFixed(1)} KB across ${summary.length} files`);
console.log(`  output: ${OUT}`);
