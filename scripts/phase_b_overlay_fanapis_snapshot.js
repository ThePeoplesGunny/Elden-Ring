#!/usr/bin/env node
// Phase B-Overlay — fanapis.com REST snapshot
// Source: https://eldenring.fanapis.com (community API, deliton/eldenring-api backing)
// Paginates 100/page across 11 endpoints -> data/fanapis/<endpoint>.json
//
// Purpose: structurally-clean mirror of the Kaggle/deliton source family.
// Arbitrates drift cases where Kaggle scrape corrupted slot names (armors)
// or mangled fields (weapons). Also carries boss drops[] — the one
// acquisition field available in fanapis. Incantation/spell requirement
// bugs (e.g. Ancient Dragons' Lightning Spear fai=0) propagate from the
// underlying source and are NOT fixed here; those still need Fextralife.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'fanapis');
const API_BASE = 'https://eldenring.fanapis.com/api';
const LIMIT = 100;
const PAGE_DELAY_MS = 150;

const ENDPOINTS = [
  { slug: 'weapons', file: 'weapons.json' },
  { slug: 'armors', file: 'armors.json' },
  { slug: 'talismans', file: 'talismans.json' },
  { slug: 'sorceries', file: 'sorceries.json' },
  { slug: 'incantations', file: 'incantations.json' },
  { slug: 'ashes', file: 'ashes_of_war.json' },
  { slug: 'spirits', file: 'spirits.json' },
  { slug: 'items', file: 'items.json' },
  { slug: 'bosses', file: 'bosses.json' },
  { slug: 'npcs', file: 'npcs.json' },
  { slug: 'locations', file: 'locations.json' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPage(slug, page) {
  const url = `${API_BASE}/${slug}?limit=${LIMIT}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${slug} page ${page}: HTTP ${res.status}`);
  return res.json();
}

async function fetchAll(slug) {
  const rows = [];
  let declaredTotal = null;
  for (let page = 0; page < 50; page++) {
    const { success, total, data } = await fetchPage(slug, page);
    if (!success) throw new Error(`${slug}: success=false`);
    if (declaredTotal === null) declaredTotal = total;
    rows.push(...data);
    if (data.length < LIMIT) break;
    await sleep(PAGE_DELAY_MS);
  }
  return { declaredTotal, rows };
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const fetchedAt = new Date().toISOString();
  const summary = [];
  for (const { slug, file } of ENDPOINTS) {
    process.stdout.write(`  ${slug.padEnd(14)} `);
    const { declaredTotal, rows } = await fetchAll(slug);
    const payload = {
      source: `${API_BASE}/${slug}`,
      fetchedAt,
      declaredTotal,
      count: rows.length,
      data: rows,
    };
    fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(payload, null, 2));
    const ok = rows.length === declaredTotal ? 'OK' : 'MISMATCH';
    console.log(`${String(rows.length).padStart(4)}/${String(declaredTotal).padEnd(4)} ${ok}  -> ${file}`);
    summary.push({ slug, fetched: rows.length, declared: declaredTotal });
  }
  console.log('\nTotal rows:', summary.reduce((a, s) => a + s.fetched, 0));
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
