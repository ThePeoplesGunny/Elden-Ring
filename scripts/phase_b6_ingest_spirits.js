#!/usr/bin/env node
// Phase B.6.1 — Kaggle spirits.csv → data/spirits.json
// Simplest phase: single source, no engine overlay, no Fextralife harvest.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KAGGLE_PATH = path.join(ROOT, 'data', 'kaggle', 'spirits.csv');
const OUT_PATH = path.join(ROOT, 'data', 'spirits.json');

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

function main() {
  const rows = parseCSV(fs.readFileSync(KAGGLE_PATH, 'utf8'));
  const h = rows[0];
  const iId = h.indexOf('id');
  const iName = h.indexOf('name');
  const iDesc = h.indexOf('description');
  const iFp = h.indexOf('fpCost');
  const iHp = h.indexOf('hpCost');
  const iEffect = h.indexOf('effect');

  const seen = new Map();
  const out = [];
  const duplicates = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[iName]) continue;
    const name = row[iName];
    if (seen.has(name)) {
      duplicates.push({ name, ids: [seen.get(name), row[iId]] });
      continue;
    }
    seen.set(name, row[iId]);
    out.push({
      name,
      kaggleId: row[iId],
      fpCost: Number(row[iFp]) || 0,
      hpCost: Number(row[iHp]) || 0,
      effect: row[iEffect] || null,
      description: row[iDesc] || null,
      acquisition: null,
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B.6.1 ingest report ===');
  console.log(`Spirits written: ${out.length}/${rows.length - 1}`);
  console.log(`Duplicates: ${duplicates.length}`);
  for (const d of duplicates) console.log(`  - ${d.name} (${d.ids.join(', ')})`);
  const fpRange = [Math.min(...out.map(s => s.fpCost)), Math.max(...out.map(s => s.fpCost))];
  const hpRange = [Math.min(...out.map(s => s.hpCost)), Math.max(...out.map(s => s.hpCost))];
  console.log(`fpCost range: ${fpRange[0]} - ${fpRange[1]}`);
  console.log(`hpCost range: ${hpRange[0]} - ${hpRange[1]}`);
  console.log(`HP-cost spirits (Mimic Tear pattern): ${out.filter(s => s.hpCost > 0).length}`);
  console.log(`Acquisition coverage: 0/${out.length} — no Fextralife spirit harvest yet.`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
