#!/usr/bin/env node
// Phase B.4.2 — validation report for data/sorceries.json + data/incantations.json.
// Read-only. No Fextralife spell harvest exists yet — all rows acquisition: null.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function report(canonicalPath, engPath, catalog) {
  const spells = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  const engine = JSON.parse(fs.readFileSync(engPath, 'utf8'));

  const engineOverlaid = spells.filter(s => s.school != null).length;
  const withMotionValue = spells.filter(s => s.motionValue != null).length;
  const withCastTime = spells.filter(s => s.castTime != null).length;
  const withStep = spells.filter(s => s.walkthroughStep != null).length;
  const withReq = spells.filter(s => Object.values(s.requirements).some(v => v > 0)).length;

  const schools = new Set(spells.filter(s => s.school).map(s => s.school));
  const damageTypes = new Set(spells.filter(s => s.damageType).map(s => s.damageType));

  console.log(`\n=== ${catalog} validation ===`);
  console.log(`Canonical: ${spells.length}`);
  console.log();
  console.log('Coverage:');
  console.log(`  schooling (engine overlay):  ${engineOverlaid}/${spells.length} (${Math.round(100*engineOverlaid/spells.length)}%)`);
  console.log(`  motionValue (damage math):   ${withMotionValue}/${spells.length} (${Math.round(100*withMotionValue/spells.length)}%)`);
  console.log(`  castTime:                    ${withCastTime}/${spells.length} (${Math.round(100*withCastTime/spells.length)}%)`);
  console.log(`  walkthroughStep (acquisition):${withStep}/${spells.length} (${Math.round(100*withStep/spells.length)}%)`);
  console.log(`  requirements non-zero:       ${withReq}/${spells.length}`);
  console.log();
  console.log(`Distinct schools (engine-curated subset): ${schools.size}`);
  for (const s of [...schools].sort()) console.log(`  - ${s}`);
  console.log();
  console.log(`Distinct damage types: ${damageTypes.size}`);
  for (const d of [...damageTypes].sort()) console.log(`  - ${d}`);
  console.log();
  console.log(`Acquisition coverage: 0/${spells.length} — no Fextralife spell harvest yet.`);
}

function main() {
  report(
    path.join(ROOT, 'data', 'sorceries.json'),
    path.join(ROOT, 'tc_next', 'data', 'sorceries_engine.json'),
    'Sorcery'
  );
  report(
    path.join(ROOT, 'data', 'incantations.json'),
    path.join(ROOT, 'tc_next', 'data', 'incantations_engine.json'),
    'Incantation'
  );
}

main();
