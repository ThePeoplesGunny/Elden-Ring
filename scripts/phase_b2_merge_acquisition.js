#!/usr/bin/env node
// Phase B.2.2 — merge Fextralife talisman_acquisition.json (21 entries)
// into data/talismans.json.
//
// Fextralife wins on weight (overwrites engine weight where harvested).
// Fextralife-only fields added: effectPrecise, effectCategory, stackingRule, acquisition.

const fs = require('fs');
const path = require('path');

const TALISMANS_PATH = path.join(__dirname, '..', 'data', 'talismans.json');
const HARVEST_PATH = path.join(__dirname, '..', 'data', 'talisman_acquisition.json');

function main() {
  const talismans = JSON.parse(fs.readFileSync(TALISMANS_PATH, 'utf8'));
  const harvestDoc = JSON.parse(fs.readFileSync(HARVEST_PATH, 'utf8'));
  const harvest = harvestDoc.talismans;

  const byName = new Map(talismans.map(t => [t.name, t]));

  const applied = [];
  const notFound = [];
  const weightChanged = [];

  for (const h of harvest) {
    const t = byName.get(h.name);
    if (!t) {
      notFound.push(h.name);
      continue;
    }

    if (t.weight != null && h.weight != null && t.weight !== h.weight) {
      weightChanged.push({ name: h.name, old: t.weight, new: h.weight });
    }
    if (h.weight != null) t.weight = h.weight;

    t.effectPrecise = h.effectPrecise;
    t.effectCategory = h.effectCategory;
    t.stackingRule = h.stackingRule;
    t.acquisition = {
      type: h.acquisitionType,
      specific: h.acquisitionSpecific,
      region: h.region,
      prerequisites: h.prerequisites,
      notes: h.notes,
      flagged: h.flagged,
      sourceUrl: h.sourceUrl,
    };

    applied.push(h.name);
  }

  fs.writeFileSync(TALISMANS_PATH, JSON.stringify(talismans, null, 2));

  console.log('=== Phase B.2.2 merge report ===');
  console.log(`Harvest entries: ${harvest.length}`);
  console.log(`Applied: ${applied.length}`);
  console.log(`Not found in canonical (name mismatch): ${notFound.length}`);
  for (const n of notFound) console.log(`  - ${n}`);
  console.log(`Weight overwritten (engine vs Fextralife differed): ${weightChanged.length}`);
  for (const c of weightChanged) {
    console.log(`  - ${c.name}: engine ${c.old} -> Fextralife ${c.new}`);
  }
  console.log(`Output: ${TALISMANS_PATH}`);
}

main();
