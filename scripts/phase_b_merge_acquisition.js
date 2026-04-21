#!/usr/bin/env node
// Phase B.2 — merge Fextralife harvest (data/weapon_acquisition.json, 56 entries)
// into data/weapons.json.
//
// Harvest wins on conflicts for: requirements, scaling, damageTypes, defaultSkill,
// canInfuse, uniqueWeapon, acquisition. Deliton fields (stats, weight, category,
// description, delitonId) are never overwritten.
//
// Rationale: Fextralife harvest was spot-checked + engine-matched; deliton source
// has documented errors (empty-name req slots for Siluria's Tree, etc.). Harvest
// is authoritative where it covers.

const fs = require('fs');
const path = require('path');

const WEAPONS_PATH = path.join(__dirname, '..', 'data', 'weapons.json');
const HARVEST_PATH = path.join(__dirname, '..', 'data', 'weapon_acquisition.json');

function main() {
  const weapons = JSON.parse(fs.readFileSync(WEAPONS_PATH, 'utf8'));
  const harvestDoc = JSON.parse(fs.readFileSync(HARVEST_PATH, 'utf8'));
  const harvest = harvestDoc.weapons;

  const byName = new Map(weapons.map(w => [w.name, w]));

  const applied = [];
  const notFound = [];
  const reqsChanged = [];
  const scalingChanged = [];

  for (const h of harvest) {
    const w = byName.get(h.name);
    if (!w) {
      notFound.push(h.name);
      continue;
    }

    const oldReqs = JSON.stringify(w.requirements);
    const newReqs = JSON.stringify(h.requirements);
    if (oldReqs !== newReqs) reqsChanged.push({ name: h.name, old: w.requirements, new: h.requirements });

    const oldScaling = JSON.stringify(w.scaling);
    const newScaling = JSON.stringify(h.scaling);
    if (oldScaling !== newScaling) scalingChanged.push({ name: h.name, old: w.scaling, new: h.scaling });

    w.requirements = h.requirements;
    w.scaling = h.scaling;
    w.damageTypes = h.damageTypes;
    w.defaultSkill = h.defaultSkill;
    w.canInfuse = h.canInfuse;
    w.uniqueWeapon = h.uniqueWeapon;
    w.acquisition = {
      type: h.acquisitionType,
      specific: h.acquisitionSpecific,
      region: h.region,
      dropRate: h.dropRate,
      prerequisites: h.prerequisites,
      merchantCost: h.merchantCost,
      sourceUrl: h.sourceUrl,
    };

    applied.push(h.name);
  }

  fs.writeFileSync(WEAPONS_PATH, JSON.stringify(weapons, null, 2));

  console.log('=== Phase B.2 merge report ===');
  console.log(`Harvest entries: ${harvest.length}`);
  console.log(`Applied: ${applied.length}`);
  console.log(`Not found in deliton (excluded or name mismatch): ${notFound.length}`);
  for (const n of notFound) console.log(`  - ${n}`);
  console.log(`Requirements overwritten (deliton was wrong or different): ${reqsChanged.length}`);
  for (const c of reqsChanged) {
    console.log(`  - ${c.name}`);
    console.log(`    old: ${JSON.stringify(c.old)}`);
    console.log(`    new: ${JSON.stringify(c.new)}`);
  }
  console.log(`Scaling overwritten: ${scalingChanged.length}`);
  for (const c of scalingChanged) {
    console.log(`  - ${c.name}`);
    console.log(`    old: ${JSON.stringify(c.old)}`);
    console.log(`    new: ${JSON.stringify(c.new)}`);
  }
  console.log(`Output: ${WEAPONS_PATH}`);
}

main();
