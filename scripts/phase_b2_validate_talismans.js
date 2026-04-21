#!/usr/bin/env node
// Phase B.2.3 — validation report for data/talismans.json.
// Read-only. Reports coverage by field group:
//   - Engine-curated overlay (weight, engineEffect, engineValue)
//   - Fextralife harvest overlay (acquisition, effectPrecise, effectCategory, stackingRule)
//   - Engine entries missing from canonical (data gap)

const fs = require('fs');
const path = require('path');

const TALISMANS_PATH = path.join(__dirname, '..', 'data', 'talismans.json');
const ENGINE_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'talismans_engine.json');
const HARVEST_PATH = path.join(__dirname, '..', 'data', 'talisman_acquisition.json');

function main() {
  const talismans = JSON.parse(fs.readFileSync(TALISMANS_PATH, 'utf8'));
  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));
  const harvestDoc = JSON.parse(fs.readFileSync(HARVEST_PATH, 'utf8'));
  const harvest = harvestDoc.talismans;

  const withWeight = talismans.filter(t => t.weight != null).length;
  const withEngine = talismans.filter(t => t.engineEffect != null).length;
  const withAcquisition = talismans.filter(t => t.acquisition != null).length;
  const withEffectPrecise = talismans.filter(t => t.effectPrecise != null).length;

  const talismanNames = new Set(talismans.map(t => t.name));
  const engineMissing = engine.filter(e => !talismanNames.has(e.name));
  const harvestMissing = harvest.filter(h => !talismanNames.has(h.name));

  const unharvested = talismans.filter(t => t.acquisition == null).map(t => t.name);

  console.log('=== Phase B.2.3 validation report ===');
  console.log(`Canonical talismans: ${talismans.length}`);
  console.log();
  console.log('Coverage by field group:');
  console.log(`  weight:          ${withWeight}/${talismans.length} (${Math.round(100 * withWeight / talismans.length)}%)`);
  console.log(`  engineEffect:    ${withEngine}/${talismans.length} (${Math.round(100 * withEngine / talismans.length)}%)`);
  console.log(`  acquisition:     ${withAcquisition}/${talismans.length} (${Math.round(100 * withAcquisition / talismans.length)}%)`);
  console.log(`  effectPrecise:   ${withEffectPrecise}/${talismans.length} (${Math.round(100 * withEffectPrecise / talismans.length)}%)`);
  console.log();
  console.log(`Engine entries missing from canonical (data/talismans.json): ${engineMissing.length}`);
  for (const e of engineMissing) console.log(`  - ${e.name}`);
  console.log();
  console.log(`Harvest entries missing from canonical (shouldn't happen — name mismatch): ${harvestMissing.length}`);
  for (const h of harvestMissing) console.log(`  - ${h.name}`);
  console.log();
  console.log(`Unharvested (no Fextralife acquisition): ${unharvested.length}/${talismans.length}`);
  console.log('  (next Fextralife harvest batches will close this gap)');
}

main();
