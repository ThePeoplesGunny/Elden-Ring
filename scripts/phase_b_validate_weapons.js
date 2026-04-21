#!/usr/bin/env node
// Phase B.3 — cross-validate data/weapons.json against engine (tc_next/data/).
// For every canonical weapon:
//   - Look up in eng_weapon_names.json by name.
//   - Look up base variant in weapons_encoded.json (affinity -1 unique OR 0 standard).
//   - Compare requirements. Report drift.
// Does NOT mutate. Read-only.

const fs = require('fs');
const path = require('path');

const WEAPONS_PATH = path.join(__dirname, '..', 'data', 'weapons.json');
const ENG_NAMES_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'eng_weapon_names.json');
const ENG_ENCODED_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'weapons_encoded.json');

function normReq(r) {
  return {
    str: r?.str || 0,
    dex: r?.dex || 0,
    int: r?.int || 0,
    fai: r?.fai || 0,
    arc: r?.arc || 0,
  };
}

function eqReq(a, b) {
  return a.str === b.str && a.dex === b.dex && a.int === b.int && a.fai === b.fai && a.arc === b.arc;
}

function main() {
  const weapons = JSON.parse(fs.readFileSync(WEAPONS_PATH, 'utf8'));
  const engNames = JSON.parse(fs.readFileSync(ENG_NAMES_PATH, 'utf8'));
  const engEncoded = JSON.parse(fs.readFileSync(ENG_ENCODED_PATH, 'utf8'));

  const engNameSet = new Set(engNames.map(e => e.name));
  // Base variant = affinity -1 (unique) or affinity 0 (standard/base of infusable)
  const baseVariant = new Map();
  for (const w of engEncoded) {
    if (w.a === -1 || w.a === 0) {
      if (!baseVariant.has(w.w)) baseVariant.set(w.w, w);
    }
  }

  const missing = [];
  const reqMismatch = [];
  const noBaseVariant = [];

  for (const w of weapons) {
    if (!engNameSet.has(w.name)) {
      missing.push(w.name);
      continue;
    }
    const base = baseVariant.get(w.name);
    if (!base) {
      noBaseVariant.push(w.name);
      continue;
    }
    const ours = normReq(w.requirements);
    const theirs = normReq(base.r);
    if (!eqReq(ours, theirs)) {
      reqMismatch.push({ name: w.name, canonical: ours, engine: theirs });
    }
  }

  console.log('=== Phase B.3 validation report ===');
  console.log(`Canonical weapons: ${weapons.length}`);
  console.log(`Engine unique names: ${engNames.length}`);
  console.log();
  console.log(`Not in engine eng_weapon_names.json: ${missing.length}`);
  for (const n of missing) console.log(`  - ${n}`);
  console.log();
  console.log(`In engine names but no base variant (a=-1 or 0) in weapons_encoded: ${noBaseVariant.length}`);
  for (const n of noBaseVariant) console.log(`  - ${n}`);
  console.log();
  console.log(`Requirement mismatches (canonical vs engine): ${reqMismatch.length}`);
  for (const m of reqMismatch) {
    console.log(`  - ${m.name}`);
    console.log(`    canonical: ${JSON.stringify(m.canonical)}`);
    console.log(`    engine:    ${JSON.stringify(m.engine)}`);
  }
  console.log();
  const matched = weapons.length - missing.length - noBaseVariant.length;
  const clean = matched - reqMismatch.length;
  console.log(`Summary: ${clean}/${weapons.length} clean, ${reqMismatch.length} drift, ${missing.length + noBaseVariant.length} unmatched`);
}

main();
