#!/usr/bin/env node
// Phase B.7.1 — Kaggle items.csv -> data/items.json
// Single source (Kaggle items.csv; deliton items.json is a subset and contributes
// nothing extra). Derives an itemType discriminator from name/effect/description,
// since the source `type` column is dirty (blanks, scaling letters, weight values,
// shield guard strings bleeding in from other columns).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KAGGLE_PATH = path.join(ROOT, 'data', 'kaggle', 'items.csv');
const OUT_PATH = path.join(ROOT, 'data', 'items.json');

function parseCSV(text) {
  const rows = [[]];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { rows[rows.length - 1].push(field); field = ''; }
      else if (c === '\n') { rows[rows.length - 1].push(field); rows.push([]); field = ''; }
      else if (c !== '\r') field += c;
    }
  }
  if (field.length || rows[rows.length - 1].length) rows[rows.length - 1].push(field);
  return rows.filter(r => r.length > 1);
}

const NAME_CORRECTIONS = {
  'Lost Ashes Of War': 'Lost Ashes of War',
};

function normalizeName(raw) {
  const trimmed = (raw || '').trim();
  return NAME_CORRECTIONS[trimmed] || trimmed;
}

function classify(row) {
  const name = row.name || '';
  const effect = (row.effect || '').toLowerCase();
  const desc = (row.description || '').toLowerCase();
  const src = (row.type || '').trim();
  const blob = effect + ' ' + desc;

  // Flask — canonical trio
  if (/^Flask of (Crimson|Cerulean|Wondrous Physick)/i.test(name)) return 'flask';

  // Crystal tear — source type is reliable
  if (src === 'Crystal Tear' || src === 'Crystal Tears') return 'crystal_tear';

  // Key items — source type is reliable
  if (src === 'Key Item') return 'key';

  // Notes / info items
  if (src === 'Info Item' || /^Note:/i.test(name)) return 'note';

  // Online-play items — catch by name first (several have weight/consumable source types)
  if (/\b(Cipher Ring|Trick-mirror|Prattling Pate|Furled Finger|Finger Severer|Finger Remedy|Wizened Finger|Taunter's Tongue|Bloody Finger|Recusant Finger|Small (Golden|Red) Effigy)\b/i.test(name)) return 'online';
  if (/online play|another world|summoning sign|invader|invasion/i.test(blob)) return 'online';

  // Remembrance — boss trophies traded at Finger Reader
  if (/^Remembrance of/i.test(name) || name === 'Elden Remembrance') return 'remembrance';

  // Grease — weapon/shield coatings (name suffix is reliable)
  if (/\bGrease$/i.test(name)) return 'grease';

  // Cookbooks
  if (src === 'Expands crafting repertoire') return 'cookbook';
  if (/\bCookbook\b/i.test(name) && /crafting|expands/i.test(blob)) return 'cookbook';

  // Runes — explicit name matches (source `Rune` suffix is reliable here)
  if (/^(Pauper|Soldier|Noble|Lordsworn|Knight|Claimant|Lord|Hero|Numen)('s)? Rune(\s*[\[\(]\d+[\]\)])?$/i.test(name)) return 'rune';
  if (/^Numen'srune$/i.test(name)) return 'rune'; // source typo preserved
  if (/^Golden Rune\s*[\[\(]?\d*[\]\)]?$/i.test(name)) return 'rune';
  if (/^(Lands Between Rune|Rune Arc)$/i.test(name)) return 'rune';

  // Throwables — corrupted-type rows (scaling letters) + name patterns
  if (/^(Str|Dex|Int|Fai|Arc)\s/.test(src)) return 'throwable';
  if (/\b(Pot|Dart|Aromatic|Bairn|Throwing Dagger|Kukri|Fan Daggers|Bone Dart|Stone Clump|Explosive Stone|Poisoned Stone|Gravity Stone|Cuckoo Glintstone|Glintstone Scrap|Bewitching Branch|Spraymist)\b/i.test(name) &&
      /\b(throw|hurl|scatter|uses fp|thrown|at enemies|inflict|explode|produce a magic bolt|produce many magic bolts)/i.test(blob)) return 'throwable';

  // Reusable — source type clean
  if (src === 'Reusable') return 'reusable';

  // Consumable — source type OR explicit consumable name/effect patterns
  if (src === 'Consumable') return 'consumable';
  if (/\b(cured meat|boluses?|cookie|raisin|dried liver|pickled (turtle neck|fowl foot)|exalted flesh|raw meat dumpling|boiled prawn|starlight shards|baldachin's blessing|rowa raisin|frozen raisin)\b/i.test(name)) return 'consumable';
  if (/^Golden Seed$|^Sacred Tear$/i.test(name)) return 'consumable';
  if (/temporarily|for a short time|briefly/i.test(effect) && !/equipped|wearer/i.test(desc)) return 'consumable';

  // Crafting materials
  if (/\b(crafting material|material (used )?for crafting|crafting ingredient)\b/i.test(blob)) return 'crafting_material';
  if (src === 'Misc' && /\b(fragment|bloom|tail|blood|eye|bone|hide|feather|stem|seed|fruit|mushroom|bud|scale|liver|grease|slime|smithing stone|somber|glovewort|ghost glovewort)\b/i.test(name.toLowerCase())) {
    return 'crafting_material';
  }

  // Misc — genuine outliers: prattling-pate-less remembrances, source misfiles
  // (Torch), oddments (Grace Mimic, Glass Shard, Margit's Shackle).
  return 'misc';
}

function main() {
  const rows = parseCSV(fs.readFileSync(KAGGLE_PATH, 'utf8'));
  const h = rows[0];
  const iId = h.indexOf('id');
  const iName = h.indexOf('name');
  const iDesc = h.indexOf('description');
  const iType = h.indexOf('type');
  const iEffect = h.indexOf('effect');
  const iObtained = h.indexOf('obtainedFrom');

  const seen = new Map();
  const out = [];
  const duplicates = [];
  const nameCorrectionsApplied = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[iName]) continue;
    const rawName = row[iName];
    const name = normalizeName(rawName);
    if (name !== rawName.trim()) nameCorrectionsApplied.push({ from: rawName, to: name });

    if (seen.has(name)) {
      duplicates.push({ name, ids: [seen.get(name), row[iId]] });
      continue;
    }
    seen.set(name, row[iId]);

    const sourceType = (row[iType] || '').trim();
    const rec = {
      name,
      kaggleId: row[iId],
      itemType: classify({
        name,
        effect: row[iEffect],
        description: row[iDesc],
        type: sourceType,
      }),
      sourceType: sourceType || null,
      effect: row[iEffect] || null,
      description: row[iDesc] || null,
      obtainedFrom: (row[iObtained] && row[iObtained].trim()) || null,
      acquisition: null,
    };
    out.push(rec);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  // Report
  const dist = {};
  for (const r of out) dist[r.itemType] = (dist[r.itemType] || 0) + 1;
  const obtainedCount = out.filter(r => r.obtainedFrom).length;

  console.log('=== Phase B.7.1 ingest report ===');
  console.log(`Items written: ${out.length}/${rows.length - 1}`);
  console.log(`Duplicates: ${duplicates.length}`);
  for (const d of duplicates) console.log(`  - ${d.name} (${d.ids.join(', ')})`);
  console.log(`Name corrections applied: ${nameCorrectionsApplied.length}`);
  for (const nc of nameCorrectionsApplied) console.log(`  "${nc.from}" -> "${nc.to}"`);
  console.log(`obtainedFrom populated: ${obtainedCount}/${out.length}`);
  console.log('itemType distribution:');
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  for (const [k, v] of sorted) console.log(`  ${k.padEnd(18)} ${v}`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
