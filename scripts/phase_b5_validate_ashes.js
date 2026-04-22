#!/usr/bin/env node
// Phase B.5.2 — validation report for data/ashes_of_war.json.

const fs = require('fs');
const path = require('path');

const AOW_PATH = path.join(__dirname, '..', 'data', 'ashes_of_war.json');
const ENGINE_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'ashes_of_war.json');

function main() {
  const ashes = JSON.parse(fs.readFileSync(AOW_PATH, 'utf8'));
  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));

  const withEngine = ashes.filter(a => a.engineDmgMult != null);
  const affinityCounts = {};
  for (const a of ashes) {
    const aff = a.defaultAffinity || '(stub)';
    affinityCounts[aff] = (affinityCounts[aff] || 0) + 1;
  }
  const damageTypes = new Set(ashes.filter(a => a.engineDamageType).map(a => a.engineDamageType));
  const tiers = new Set(ashes.filter(a => a.engineTier).map(a => a.engineTier));

  console.log('=== Phase B.5.2 validation report ===');
  console.log(`Canonical ashes: ${ashes.length}`);
  console.log();
  console.log('Coverage:');
  console.log(`  engine overlay (dmgMult/fpCost): ${withEngine.length}/${ashes.length} (${Math.round(100*withEngine.length/ashes.length)}%)`);
  console.log();
  console.log('Default affinity distribution:');
  for (const [aff, count] of Object.entries(affinityCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${aff}: ${count}`);
  }
  console.log();
  console.log(`Distinct engine damage types: ${damageTypes.size}`);
  for (const t of [...damageTypes].sort()) console.log(`  - ${t}`);
  console.log(`Distinct engine tiers: ${tiers.size}`);
  for (const t of [...tiers].sort()) console.log(`  - ${t}`);
  console.log();
  console.log(`Acquisition coverage: 0/${ashes.length} — no Fextralife AoW harvest yet.`);
}

main();
