#!/usr/bin/env node
// Phase B-Overlay — fanapis locations → data/locations.json
// First canonical locations catalog. Fanapis provides {name, region, description}
// only — no joins to items, bosses, or NPCs. Useful for regional grouping and
// walkthrough step back-references.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_PATH = path.join(ROOT, 'data', 'fanapis', 'locations.json');
const OUT_PATH = path.join(ROOT, 'data', 'locations.json');

function main() {
  const src = JSON.parse(fs.readFileSync(IN_PATH, 'utf8')).data;
  const out = src.map(l => ({
    name: l.name,
    fanapisId: l.id,
    region: l.region || null,
    description: l.description || null,
  }));

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const byRegion = {};
  for (const l of out) {
    const r = l.region || '(none)';
    byRegion[r] = (byRegion[r] || 0) + 1;
  }
  console.log('=== Phase B-Overlay locations ingest ===');
  console.log(`Canonical rows: ${out.length}`);
  console.log('Regional distribution:');
  Object.entries(byRegion).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  ${String(c).padStart(4)} ${r}`);
  });
  console.log(`Wrote: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
