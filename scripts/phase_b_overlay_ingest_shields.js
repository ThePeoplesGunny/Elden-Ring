#!/usr/bin/env node
// Phase B-Overlay — fanapis shields → data/shields.json
// First canonical shield data. Canonical weapons.json excluded shields entirely
// (306 weapon entries, 0 shields). Surfaced by the merchant overlay — Kalé's
// Large Leather Shield and Patches' Horse Crest Wooden Shield had no canonical
// home. This fills the gap with the 69-row fanapis catalog.
//
// Schema: {id, name, image, description, attack[], defence[], scalesWith[],
// requiredAttributes[], category, weight}. Categories include Small Shield,
// Medium Shield, Greatshield. No engine overlay.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_PATH = path.join(ROOT, 'data', 'fanapis', 'shields.json');
const OUT_PATH = path.join(ROOT, 'data', 'shields.json');

function arrToMap(arr, key = 'name') {
  const out = {};
  for (const e of arr || []) out[e[key].toLowerCase().trim() || '_unknown'] = e.amount != null ? e.amount : e.scaling;
  return out;
}

function main() {
  const src = JSON.parse(fs.readFileSync(IN_PATH, 'utf8')).data;
  const out = src.map(s => ({
    name: s.name,
    fanapisId: s.id,
    category: s.category || null,
    weight: s.weight != null ? s.weight : null,
    attack: arrToMap(s.attack),
    defence: arrToMap(s.defence),
    scalesWith: arrToMap(s.scalesWith),
    requirements: arrToMap(s.requiredAttributes),
    description: s.description || null,
    acquisition: null,
  }));

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const byCat = {};
  for (const s of out) byCat[s.category || '?'] = (byCat[s.category || '?'] || 0) + 1;
  console.log('=== Phase B-Overlay shields ingest ===');
  console.log(`Canonical rows: ${out.length}`);
  console.log('By category:');
  Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${String(n).padStart(3)} ${c}`));
  console.log(`Wrote: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
