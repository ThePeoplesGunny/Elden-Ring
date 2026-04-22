#!/usr/bin/env node
// Phase B.7.2 — validate data/items.json
// Reports itemType distribution, flags suspicious entries, confirms schema.

const fs = require('fs');
const path = require('path');

const ITEMS_PATH = path.join(__dirname, '..', 'data', 'items.json');

function main() {
  const items = JSON.parse(fs.readFileSync(ITEMS_PATH, 'utf8'));

  console.log('=== Phase B.7.2 validation ===');
  console.log(`Total items: ${items.length}`);

  // Schema check
  const required = ['name', 'kaggleId', 'itemType', 'sourceType', 'effect', 'description', 'obtainedFrom', 'acquisition'];
  const badSchema = items.filter(i => !required.every(k => k in i));
  console.log(`Schema conformance: ${items.length - badSchema.length}/${items.length}`);
  if (badSchema.length) for (const b of badSchema.slice(0, 5)) console.log(`  MISSING: ${b.name}`);

  // Distribution
  const dist = {};
  for (const i of items) dist[i.itemType] = (dist[i.itemType] || 0) + 1;
  console.log('\nitemType distribution:');
  Object.entries(dist).sort((a, b) => b[1] - a[1]).forEach(([k, v]) =>
    console.log(`  ${k.padEnd(18)} ${String(v).padStart(4)}`));

  // Sanity flags: unusually large misc bucket is a signal the classifier needs work
  const miscPct = (dist.misc || 0) / items.length;
  console.log(`\nmisc share: ${(miscPct * 100).toFixed(1)}% (target: <10%)`);

  // Name duplicate check (should be 0 after dedup in ingest)
  const seen = new Set();
  const dup = [];
  for (const i of items) { if (seen.has(i.name)) dup.push(i.name); else seen.add(i.name); }
  console.log(`Duplicate names: ${dup.length}`);

  // Acquisition coverage
  const withObtained = items.filter(i => i.obtainedFrom).length;
  const withAcq = items.filter(i => i.acquisition).length;
  console.log(`\nobtainedFrom (Kaggle hints): ${withObtained}/${items.length}`);
  console.log(`acquisition (Fextralife harvest): ${withAcq}/${items.length}`);

  // Per-type null checks — flag buckets where effect is suspiciously absent
  console.log('\neffect/description populated by itemType:');
  const types = Object.keys(dist).sort();
  for (const t of types) {
    const subset = items.filter(i => i.itemType === t);
    const eff = subset.filter(i => i.effect && i.effect.trim()).length;
    const dsc = subset.filter(i => i.description && i.description.trim()).length;
    console.log(`  ${t.padEnd(18)} effect ${eff}/${subset.length}  desc ${dsc}/${subset.length}`);
  }

  // Spot-check misc items so they can be reviewed manually
  console.log('\nmisc items (review candidates):');
  items.filter(i => i.itemType === 'misc').forEach(i =>
    console.log(`  ${i.name.padEnd(32)} [src=${(i.sourceType || '').slice(0, 10)}] ${(i.effect || '').slice(0, 50)}`));
}

main();
