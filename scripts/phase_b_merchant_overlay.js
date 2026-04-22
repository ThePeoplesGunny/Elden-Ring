#!/usr/bin/env node
// Phase B-Merchant overlay — attributes merchant inventories to canonical items.
//
// Reads data/merchants.json (Fextralife-verbatim harvest), applies a small
// normalization map to bridge Fextralife-vs-canonical name drift, then adds
// a `merchants[]` array to matching items across 6 canonical files.
//
// Also emits data/merchant_missing_canonical.json listing items the merchants
// sell that canonical doesn't have — these are real canonical gaps
// (ammo is engine-only, shields entirely absent from canonical, 1-2
// incantation/item stragglers).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// Maps Fextralife-merchant names to canonical item names where they differ.
// Based on fuzzy-match investigation 2026-04-22 (bracket style, colon vs
// parens, "of"/"Of" case).
const NORMALIZATIONS = {
  "Armorer's Cookbook (2)": "Armorer's Cookbook [2]",
  "Missionary's Cookbook (2)": "Missionary's Cookbook [2]",
  "Smithing Stone (1)": "Smithing Stone [1]",
  "Somber Smithing Stone (9)": "Somber Smithing Stone [9]",
  "Note: Flask of Wondrous Physick": "Note (flask Of Wondrous Physick)",
  "Note: Waypoint Ruins": "Note (waypoint Ruins)",
  "Law of Regression": "Law Of Regression",
  "Ash of War: Stamp (Upward Cut)": "Ash of War: Stamp (upward Cut)",
  "Gold-Pickled Fowl Foot": "Gold-pickled Fowl Foot",
};

const CANON_FILES = [
  'items.json',
  'weapons.json',
  'armors.json',
  'shields.json',
  'ammos.json',
  'sorceries.json',
  'incantations.json',
  'ashes_of_war.json',
];

function load(f) { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
function save(f, d) { fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2)); }

function main() {
  const merchantsDoc = load('merchants.json');
  const canonByFile = {};
  const indexByName = new Map();
  for (const f of CANON_FILES) {
    canonByFile[f] = load(f);
    for (const entry of canonByFile[f]) {
      // Clear any prior merchants[] from an earlier run (idempotency)
      delete entry.merchants;
      indexByName.set(entry.name, { file: f, entry });
    }
  }

  const matched = { count: 0, normalized: 0 };
  const missing = [];
  const reverseIndex = {};

  for (const merchant of merchantsDoc.merchants) {
    for (const it of merchant.inventory) {
      const canonName = NORMALIZATIONS[it.name] || it.name;
      const wasNormalized = NORMALIZATIONS[it.name] != null;
      const hit = indexByName.get(canonName);
      if (!hit) {
        missing.push({
          merchantItemName: it.name,
          normalizedAttempt: wasNormalized ? canonName : null,
          merchant: merchant.name,
          category: it.category,
        });
        continue;
      }
      matched.count++;
      if (wasNormalized) matched.normalized++;

      const attribution = {
        merchant: merchant.name,
        location: merchant.location,
        region: merchant.region,
        runes: it.runes,
        stock: it.stock != null ? it.stock : null,
        prereq: it.prereq != null ? it.prereq : null,
        sourceUrl: merchant.sourceUrl,
      };
      if (!hit.entry.merchants) hit.entry.merchants = [];
      hit.entry.merchants.push(attribution);

      if (!reverseIndex[canonName]) reverseIndex[canonName] = [];
      reverseIndex[canonName].push(attribution);
    }
  }

  for (const f of CANON_FILES) save(f, canonByFile[f]);

  const missingDoc = {
    generatedAt: new Date().toISOString(),
    note: 'Items sold by merchants that have no matching canonical entry. Ammo/shields are structural gaps (not in canonical scope); others are missing-data stragglers worth adding to canonical.',
    missing,
  };
  fs.writeFileSync(path.join(DATA, 'merchant_missing_canonical.json'), JSON.stringify(missingDoc, null, 2));

  const reverseDoc = {
    generatedAt: new Date().toISOString(),
    note: 'item name -> [{merchant, location, region, runes, stock, prereq, sourceUrl}, ...]',
    index: reverseIndex,
  };
  fs.writeFileSync(path.join(DATA, 'merchant_reverse_index.json'), JSON.stringify(reverseDoc, null, 2));

  console.log('=== Phase B-Merchant overlay ===');
  console.log(`Matched: ${matched.count} (${matched.normalized} via normalization)`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Canonical items with merchants[]: ${Object.keys(reverseIndex).length}`);
  console.log();
  console.log('Canonical gaps (missing entries):');
  const byCategory = {};
  for (const m of missing) {
    const c = m.category || '?';
    (byCategory[c] = byCategory[c] || []).push(m.merchantItemName);
  }
  for (const [c, names] of Object.entries(byCategory)) {
    console.log(`  ${c}: ${[...new Set(names)].join(', ')}`);
  }
  console.log();
  console.log(`Wrote: data/merchant_missing_canonical.json, data/merchant_reverse_index.json`);
  console.log(`Modified: ${CANON_FILES.join(', ')}`);
}

main();
