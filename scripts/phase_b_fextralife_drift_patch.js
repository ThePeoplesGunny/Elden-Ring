#!/usr/bin/env node
// Phase B-Fextralife drift patch — applies 11 verified corrections.
//
// Sources: individual Fextralife wiki pages, fetched 2026-04-22. Each entry
// below is authoritative per project policy ("Fextralife wins on overlap"),
// resolving the 11 cases surfaced by phase_b_overlay_validate.js on the
// same date:
//   - 5 incantations with all-zero requirement bugs (B.4 data error)
//   - 1 armor drift (Redmane Knight Helm — canon, fanapis, Fextralife
//     all three disagreed on poise; Fextralife=8 is authoritative)
//   - 5 weapon req drifts (2 empty-key from deliton source corruption,
//     3 canon-missing-str cases — canon had only dex, Fextralife adds str)
//
// Flagged for Gunny in-game verification:
//   Law of Causality — Fextralife reports int=29 fai=0, unusual for an
//   incantation (normally FAI-based Golden Order). Applied as-is per
//   Fextralife authority; if in-game says otherwise, revisit.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

const INCANTATION_PATCHES = [
  { name: "Ancient Dragons' Lightning Spear", int: 0, fai: 32, arc: 0, fpCost: 25,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Ancient+Dragons%27+Lightning+Spear' },
  { name: 'Glintstone Breath', int: 0, fai: 15, arc: 12, fpCost: 28,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Glintstone+Breath' },
  { name: 'Law Of Causality', int: 29, fai: 0, arc: 0, fpCost: 22,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Law+of+Causality' },
  { name: 'Order Healing', int: 11, fai: 11, arc: 0, fpCost: 15,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Order+Healing' },
  { name: "Vyke's Dragonbolt", int: 0, fai: 23, arc: 0, fpCost: 35,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Vyke%27s+Dragonbolt' },
];

const ARMOR_PATCHES = [
  { name: 'Redmane Knight Helm', poise: 8, weight: 5.1,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Redmane+Knight+Helm' },
];

const WEAPON_PATCHES = [
  { name: "Siluria's Tree", str: 27, dex: 13, fai: 20,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Siluria%27s+Tree' },
  { name: 'Treespear', str: 15, dex: 22, fai: 18,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Treespear' },
  { name: 'Grave Scythe', str: 17, dex: 13,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Grave+Scythe' },
  { name: 'Spiked Spear', str: 14, dex: 16,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Spiked+Spear' },
  { name: "Noble's Slender Sword", str: 8, dex: 11,
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Noble%27s+Slender+Sword' },
];

function loadJson(f) { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
function writeJson(f, d) { fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2)); }

function patchIncantations() {
  const data = loadJson('incantations.json');
  const changes = [];
  for (const p of INCANTATION_PATCHES) {
    const s = data.find(x => x.name === p.name);
    if (!s) { changes.push({ name: p.name, status: 'NOT_FOUND' }); continue; }
    const before = { ...s.requirements };
    s.requirements = { int: p.int, fai: p.fai, arc: p.arc };
    if (p.fpCost != null) s.fpCost = p.fpCost;
    s.fextralife = { verifiedAt: '2026-04-22', sourceUrl: p.sourceUrl };
    changes.push({ name: p.name, before, after: s.requirements });
  }
  writeJson('incantations.json', data);
  return changes;
}

function patchArmors() {
  const data = loadJson('armors.json');
  const changes = [];
  for (const p of ARMOR_PATCHES) {
    const a = data.find(x => x.name === p.name);
    if (!a) { changes.push({ name: p.name, status: 'NOT_FOUND' }); continue; }
    const before = { poise: a.resistance.poise, weight: a.weight };
    a.resistance.poise = p.poise;
    a.weight = p.weight;
    a.fextralife = { verifiedAt: '2026-04-22', sourceUrl: p.sourceUrl };
    changes.push({ name: p.name, before, after: { poise: p.poise, weight: p.weight } });
  }
  writeJson('armors.json', data);
  return changes;
}

function patchWeapons() {
  const data = loadJson('weapons.json');
  const changes = [];
  for (const p of WEAPON_PATCHES) {
    const w = data.find(x => x.name === p.name);
    if (!w) { changes.push({ name: p.name, status: 'NOT_FOUND' }); continue; }
    const before = { ...w.requirements };
    const after = {};
    for (const k of ['str', 'dex', 'int', 'fai', 'arc']) {
      if (p[k] != null) after[k] = p[k];
    }
    w.requirements = after;
    w.fextralife = { verifiedAt: '2026-04-22', sourceUrl: p.sourceUrl };
    changes.push({ name: p.name, before, after });
  }
  writeJson('weapons.json', data);
  return changes;
}

const incChanges = patchIncantations();
const armorChanges = patchArmors();
const weaponChanges = patchWeapons();

console.log('=== Phase B-Fextralife drift patch ===');
console.log(`\nIncantations (${incChanges.length}):`);
incChanges.forEach(c => console.log(' ', JSON.stringify(c)));
console.log(`\nArmors (${armorChanges.length}):`);
armorChanges.forEach(c => console.log(' ', JSON.stringify(c)));
console.log(`\nWeapons (${weaponChanges.length}):`);
weaponChanges.forEach(c => console.log(' ', JSON.stringify(c)));
