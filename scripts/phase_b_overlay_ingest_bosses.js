#!/usr/bin/env node
// Phase B-Overlay — fanapis bosses → data/bosses.json
// First canonical boss data (engine has curated boss IDs but no drops).
// Normalizes fanapis's stringly-typed drops[] into runes (number) + items (array).
// Drops garbage entries ("Other Drops", "???"), normalizes rune decimal formats
// (European "10.000" / US "5,400" / bare "6000" all → integer).
//
// Dup handling:
//   - Alecto comma vs no-comma: fanapis has two entries, second has clearly
//     wrong data ("Limgrave" location, "Other Drops" runes). Keep canonical
//     comma form; drop the other.
//   - Godskin Apostle / Kindred Of Rot: legitimately appear at multiple
//     in-game locations. Keep both, distinguish by location field.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IN_PATH = path.join(ROOT, 'data', 'fanapis', 'bosses.json');
const OUT_PATH = path.join(ROOT, 'data', 'bosses.json');

const DROP_BLACKLIST_IDS = new Set([
  '17f69d0313fl0i1uk8pokynv71bkz8', // "Alecto Black Knife Ringleader" (no comma) — bad dup
]);

function parseRunes(str) {
  const m = /^([\d,.]+)\s+runes?$/i.exec(str.trim());
  if (!m) return null;
  const digits = m[1].replace(/[,.]/g, '');
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? null : n;
}

const GARBAGE_DROPS = new Set(['Other Drops', '???', 'N/A', 'n/a', '-']);

function normalizeDrops(raw) {
  let runes = 0;
  const items = [];
  for (const entry of raw || []) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (!trimmed || GARBAGE_DROPS.has(trimmed)) continue;
    const r = parseRunes(trimmed);
    if (r != null) { runes = r; continue; }
    // A few fanapis entries concatenate multiple drops in one string
    // (e.g. Ancient Hero of Zamor: "Radagon's Scarseal, Zamor Curved Sword, ...")
    // or split rune values oddly ("1, 600 Runes"). Split on ", " and re-check
    // each part for runes/garbage.
    const parts = trimmed.includes(', ') ? trimmed.split(/,\s+/) : [trimmed];
    for (const p of parts) {
      const pp = p.trim();
      if (!pp || GARBAGE_DROPS.has(pp)) continue;
      const r2 = parseRunes(pp);
      if (r2 != null) { runes = Math.max(runes, r2); continue; }
      // Skip bare numbers left over from mangled rune splits (e.g. "1" from "1, 600 Runes")
      if (/^\d+$/.test(pp)) continue;
      items.push(pp);
    }
  }
  return { runes: runes || null, items };
}

function main() {
  const src = JSON.parse(fs.readFileSync(IN_PATH, 'utf8')).data;
  const out = [];
  let droppedDups = 0;
  let totalItems = 0;
  for (const b of src) {
    if (DROP_BLACKLIST_IDS.has(b.id)) { droppedDups++; continue; }
    const { runes, items } = normalizeDrops(b.drops);
    totalItems += items.length;
    out.push({
      name: b.name,
      fanapisId: b.id,
      region: b.region || null,
      location: b.location || null,
      description: b.description || null,
      runes,
      drops: items,
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B-Overlay bosses ingest ===');
  console.log(`Source rows: ${src.length}`);
  console.log(`Blacklisted (bad dup): ${droppedDups}`);
  console.log(`Canonical rows: ${out.length}`);
  console.log(`Total item drops (acquisition mappings): ${totalItems}`);
  console.log(`Bosses with rune drops: ${out.filter(b => b.runes != null).length}`);
  console.log(`Bosses with 0 item drops: ${out.filter(b => b.drops.length === 0).length}`);
  console.log(`Wrote: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
