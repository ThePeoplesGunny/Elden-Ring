#!/usr/bin/env node
// Phase B.1 — deliton weapons.json → data/weapons.json
// Normalizes 307 deliton weapon records into canonical schema.
// Fextralife-only fields (damageTypes, defaultSkill, canInfuse, uniqueWeapon, acquisition)
// are null here; phase_b_merge_acquisition.js overlays the 56-entry harvest after.

const fs = require('fs');
const path = require('path');

const DELITON_PATH = path.join(__dirname, '..', 'data', 'deliton_json', 'weapons.json');
const ENG_NAMES_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'eng_weapon_names.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'weapons.json');

const ATTACK_KEYS = { Phy: 'phy', Mag: 'mag', Fire: 'fire', Ligt: 'ligt', Holy: 'holy', Crit: 'crit' };
const DEFENCE_KEYS = { Phy: 'phy', Mag: 'mag', Fire: 'fire', Ligt: 'ligt', Holy: 'holy', Boost: 'boost' };
const ATTR_KEYS = { str: 'str', dex: 'dex', int: 'int', fai: 'fai', arc: 'arc' };

const ATTACK_ALIASES = {
  'e-color="">Mag': 'Mag',
  'e">Mag': 'Mag',
  'Phy120': 'Phy',
  'Light': 'Ligt',
};

// Deliton-to-engine name corrections beyond case-only (punctuation, periods, etc.)
// Case-only drift is handled automatically via engLowerMap.
const NAME_CORRECTIONS = {
  'Sword Of St Trina': 'Sword of St. Trina',
};
const DROPPED_ATTACK_KEYS = new Set(['Rng', 'Sor', 'Sorc', 'Inc']);
const SCALING_VALUE_NULL = new Set(['?', '-', '', undefined, null]);

const report = {
  weaponsWritten: 0,
  duplicates: [],
  droppedAttackKeys: {},
  cleanedAttackKeys: {},
  droppedScalingEntries: 0,
  droppedReqEntries: 0,
  weaponsWithDirtyData: [],
  nameNormalized: [],
};

function normalizeAttr(name) {
  if (!name) return null;
  const lower = String(name).toLowerCase();
  return ATTR_KEYS[lower] || null;
}

function normalizeAttack(deliton) {
  const out = { phy: 0, mag: 0, fire: 0, ligt: 0, holy: 0, crit: 100 };
  let dirty = false;
  for (const entry of deliton.attack || []) {
    let key = entry.name;
    if (ATTACK_ALIASES[key]) {
      report.cleanedAttackKeys[key] = (report.cleanedAttackKeys[key] || 0) + 1;
      key = ATTACK_ALIASES[key];
      dirty = true;
    }
    if (DROPPED_ATTACK_KEYS.has(key)) {
      report.droppedAttackKeys[key] = (report.droppedAttackKeys[key] || 0) + 1;
      continue;
    }
    const mapped = ATTACK_KEYS[key];
    if (!mapped) continue;
    out[mapped] = entry.amount ?? 0;
  }
  return { attack: out, dirty };
}

function normalizeDefence(deliton) {
  const out = { phy: 0, mag: 0, fire: 0, ligt: 0, holy: 0, boost: 0 };
  for (const entry of deliton.defence || []) {
    const mapped = DEFENCE_KEYS[entry.name];
    if (!mapped) continue;
    out[mapped] = entry.amount ?? 0;
  }
  return out;
}

function normalizeScaling(deliton) {
  const out = { str: null, dex: null, int: null, fai: null, arc: null };
  let dirty = false;
  for (const entry of deliton.scalesWith || []) {
    const attr = normalizeAttr(entry.name);
    if (!attr) {
      report.droppedScalingEntries++;
      dirty = true;
      continue;
    }
    const val = entry.scaling;
    out[attr] = SCALING_VALUE_NULL.has(val) ? null : val;
  }
  return { scaling: out, dirty };
}

function normalizeRequirements(deliton) {
  const out = { str: 0, dex: 0, int: 0, fai: 0, arc: 0 };
  let dirty = false;
  for (const entry of deliton.requiredAttributes || []) {
    const attr = normalizeAttr(entry.name);
    if (!attr) {
      report.droppedReqEntries++;
      dirty = true;
      continue;
    }
    out[attr] = Number(entry.amount) || 0;
  }
  return { requirements: out, dirty };
}

function transform(w, engLowerMap) {
  const { attack, dirty: aDirty } = normalizeAttack(w);
  const defence = normalizeDefence(w);
  const { scaling, dirty: sDirty } = normalizeScaling(w);
  const { requirements, dirty: rDirty } = normalizeRequirements(w);
  if (aDirty || sDirty || rDirty) report.weaponsWithDirtyData.push(w.name);

  let canonicalName = w.name;
  if (NAME_CORRECTIONS[w.name]) {
    canonicalName = NAME_CORRECTIONS[w.name];
    report.nameNormalized.push({ deliton: w.name, engine: canonicalName, kind: 'manual' });
  } else {
    const engCanonical = engLowerMap.get(w.name.toLowerCase());
    if (engCanonical && engCanonical !== w.name) {
      report.nameNormalized.push({ deliton: w.name, engine: engCanonical, kind: 'case' });
      canonicalName = engCanonical;
    }
  }

  return {
    name: canonicalName,
    delitonId: w.id,
    delitonName: canonicalName !== w.name ? w.name : undefined,
    category: w.category,
    weight: w.weight,
    requirements,
    scaling,
    attack,
    defence,
    damageTypes: null,
    defaultSkill: null,
    canInfuse: null,
    uniqueWeapon: null,
    acquisition: null,
    description: w.description,
  };
}

function main() {
  const deliton = JSON.parse(fs.readFileSync(DELITON_PATH, 'utf8'));
  const engNames = JSON.parse(fs.readFileSync(ENG_NAMES_PATH, 'utf8'));
  const engLowerMap = new Map(engNames.map(e => [e.name.toLowerCase(), e.name]));

  const seen = new Map();
  const out = [];
  for (const w of deliton) {
    if (seen.has(w.name)) {
      report.duplicates.push({ name: w.name, ids: [seen.get(w.name).id, w.id] });
      continue;
    }
    seen.set(w.name, w);
    out.push(transform(w, engLowerMap));
  }
  report.weaponsWritten = out.length;

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B.1 ingest report ===');
  console.log(`Weapons written: ${report.weaponsWritten}/${deliton.length}`);
  console.log(`Duplicates dropped: ${report.duplicates.length}`);
  for (const d of report.duplicates) console.log(`  - ${d.name} (ids: ${d.ids.join(', ')})`);
  console.log(`Cleaned attack keys: ${JSON.stringify(report.cleanedAttackKeys)}`);
  console.log(`Dropped attack keys (not in damage-type schema): ${JSON.stringify(report.droppedAttackKeys)}`);
  console.log(`Dropped scaling entries (empty/dash name): ${report.droppedScalingEntries}`);
  console.log(`Dropped requirement entries (empty/dash name): ${report.droppedReqEntries}`);
  console.log(`Weapons with any dirty data: ${report.weaponsWithDirtyData.length}`);
  if (report.weaponsWithDirtyData.length <= 20) {
    for (const n of report.weaponsWithDirtyData) console.log(`  - ${n}`);
  }
  console.log(`Names normalized to engine canonical form: ${report.nameNormalized.length}`);
  for (const m of report.nameNormalized) console.log(`  - "${m.deliton}" -> "${m.engine}"`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
