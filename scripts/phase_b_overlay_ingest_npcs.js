#!/usr/bin/env node
// Phase B-Overlay — fanapis npcs → data/npcs.json
// First canonical NPC data. Fanapis provides {name, location, role} only —
// no merchant inventory, quest rewards, or gift items. Useful as a lookup
// scaffold; later Fextralife harvest will overlay inventory/quest data.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_PATH = path.join(ROOT, 'data', 'fanapis', 'npcs.json');
const OUT_PATH = path.join(ROOT, 'data', 'npcs.json');

function main() {
  const src = JSON.parse(fs.readFileSync(IN_PATH, 'utf8')).data;
  const out = src.map(n => ({
    name: n.name,
    fanapisId: n.id,
    location: (n.location || '').trim() || null,
    role: (n.role || '').trim() || null,
    quote: n.quote || null,
  }));

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const merchants = out.filter(n => /shop|merchant|vendor/i.test(n.role || ''));
  console.log('=== Phase B-Overlay npcs ingest ===');
  console.log(`Canonical rows: ${out.length}`);
  console.log(`With location: ${out.filter(n => n.location).length}`);
  console.log(`With role: ${out.filter(n => n.role).length}`);
  console.log(`Merchant-like roles: ${merchants.length}`);
  console.log(`Wrote: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
