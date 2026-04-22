#!/usr/bin/env node
// Phase B-Overlay — fanapis ammos → data/ammos.json
// First canonical ammo data. Engine has tc_next/data/ammo_data.json with 30
// entries; fanapis provides 53-entry superset. Surfaced by merchant overlay —
// Arrow, Bolt, Great Arrow, Ballista Bolt had no canonical home.
//
// Schema: {id, name, image, description, type, attackPower[], passive}.
// Type is Pierce / Standard / Strike etc. No weight. No engine union in
// this pass — straight fanapis snapshot.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_PATH = path.join(ROOT, 'data', 'fanapis', 'ammos.json');
const OUT_PATH = path.join(ROOT, 'data', 'ammos.json');

function arrToMap(arr, key = 'name') {
  const out = {};
  for (const e of arr || []) out[e[key].toLowerCase().trim() || '_unknown'] = e.amount;
  return out;
}

function main() {
  const src = JSON.parse(fs.readFileSync(IN_PATH, 'utf8')).data;
  const out = src.map(a => ({
    name: a.name,
    fanapisId: a.id,
    type: a.type || null,
    attackPower: arrToMap(a.attackPower),
    passive: a.passive && a.passive !== '-' ? a.passive : null,
    description: a.description || null,
    acquisition: null,
  }));

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const byType = {};
  for (const a of out) byType[a.type || '?'] = (byType[a.type || '?'] || 0) + 1;
  console.log('=== Phase B-Overlay ammos ingest ===');
  console.log(`Canonical rows: ${out.length}`);
  console.log('By type:');
  Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${String(n).padStart(3)} ${t}`));
  console.log(`Wrote: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
