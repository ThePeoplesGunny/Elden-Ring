#!/usr/bin/env node
// Phase B.3.1 — Kaggle armors.csv + tc_next/data/armor_engine.json
// → data/armors.json
//
// Source differs from B.1/B.2: no deliton armors.json (deliton snapshot lacks
// this item class). Kaggle CSV is primary source. No Fextralife armor harvest
// exists yet — all rows get acquisition: null.
//
// Kaggle data is dirty: dmgNegation/resistance fields have name-typos
// (StrEldenike, 6.1, VS, Pose, Vitality26, Death, etc.) but array ORDER is
// consistent. Positional assignment recovers correct values.
//
// Engine overlay (armor_engine.json, 19 curated sets × 4 pieces = ~76 pieces)
// contributes setName, setTier, enginePoise (authoritative piece poise).

const fs = require('fs');
const path = require('path');

const KAGGLE_PATH = path.join(__dirname, '..', 'data', 'kaggle', 'armors.csv');
const ENGINE_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'armor_engine.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'armors.json');

const NEG_SLOTS = ['phy', 'strike', 'slash', 'pierce', 'magic', 'fire', 'ligt', 'holy'];
const RES_SLOTS = ['immunity', 'robustness', 'focus', 'vitality', 'poise'];

const CATEGORY_TO_SLOT = {
  'Helm': 'head',
  'Chest Armor': 'chest',
  'Gauntlets': 'arms',
  'Gauntlet': 'arms',
  'Leg Armor': 'legs',
};

const NAME_CORRECTIONS = {};

const report = {
  armorsWritten: 0,
  duplicates: [],
  nameNormalized: [],
  engineOverlayApplied: 0,
  enginePiecesNotInKaggle: [],
  dirtyNegKeys: {},
  dirtyResKeys: {},
  dropped: 0,
};

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

function parsePyArray(s) {
  // Python-dict-style array with single quotes -> JSON.
  // Safe for dmgNegation and resistance fields which are known simple {name, amount} structures.
  return JSON.parse(s.replace(/'/g, '"'));
}

function assignPositional(arr, slotNames, report, kind) {
  const out = {};
  for (let i = 0; i < slotNames.length; i++) out[slotNames[i]] = 0;
  for (let i = 0; i < arr.length && i < slotNames.length; i++) {
    const entry = arr[i];
    const slot = slotNames[i];
    const amt = Number(entry.amount) || 0;
    out[slot] = amt;
    if (entry.name && entry.name.toLowerCase() !== slot.toLowerCase()) {
      const variants = kind === 'neg' ? report.dirtyNegKeys : report.dirtyResKeys;
      variants[entry.name] = (variants[entry.name] || 0) + 1;
    }
  }
  return out;
}

const SLOT_TO_CATEGORY = {
  head: 'Helm',
  chest: 'Chest Armor',
  arms: 'Gauntlets',
  legs: 'Leg Armor',
};

function buildEngineIndex(engine) {
  const byPieceName = new Map();
  for (const set of engine) {
    for (const slot of ['head', 'chest', 'arms', 'legs']) {
      const piece = set.pc && set.pc[slot];
      if (!piece) continue;
      byPieceName.set(piece.n, {
        setName: set.n,
        setTier: set.c,
        enginePoise: piece.po,
        slot,
        weight: piece.w,
        piece,
      });
    }
  }
  return byPieceName;
}

function main() {
  const text = fs.readFileSync(KAGGLE_PATH, 'utf8');
  const rows = parseCSV(text);
  const header = rows[0];
  const iId = header.indexOf('id');
  const iName = header.indexOf('name');
  const iDesc = header.indexOf('description');
  const iCat = header.indexOf('category');
  const iNeg = header.indexOf('dmgNegation');
  const iRes = header.indexOf('resistance');
  const iWeight = header.indexOf('weight');

  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));
  const engineIndex = buildEngineIndex(engine);
  const engineNames = new Set(engineIndex.keys());

  const seen = new Map();
  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[iName]) { report.dropped++; continue; }

    const name = row[iName];
    if (seen.has(name)) {
      report.duplicates.push({ name, ids: [seen.get(name), row[iId]] });
      continue;
    }
    seen.set(name, row[iId]);

    let canonicalName = name;
    if (NAME_CORRECTIONS[name]) {
      canonicalName = NAME_CORRECTIONS[name];
      report.nameNormalized.push({ kaggle: name, engine: canonicalName, kind: 'manual' });
    } else {
      // Case-insensitive engine lookup for name normalization
      for (const engName of engineNames) {
        if (engName.toLowerCase() === name.toLowerCase() && engName !== name) {
          canonicalName = engName;
          report.nameNormalized.push({ kaggle: name, engine: canonicalName, kind: 'case' });
          break;
        }
      }
    }

    let negArr = [];
    let resArr = [];
    try { negArr = parsePyArray(row[iNeg] || '[]'); } catch (e) { }
    try { resArr = parsePyArray(row[iRes] || '[]'); } catch (e) { }

    const dmgNegation = assignPositional(negArr, NEG_SLOTS, report, 'neg');
    const resistance = assignPositional(resArr, RES_SLOTS, report, 'res');

    const category = row[iCat] === 'Gauntlet' ? 'Gauntlets' : row[iCat];
    const slot = CATEGORY_TO_SLOT[category] || null;
    const weight = Number(row[iWeight]) || 0;

    const engEntry = engineIndex.get(canonicalName);
    if (engEntry) report.engineOverlayApplied++;

    out.push({
      name: canonicalName,
      kaggleId: row[iId],
      kaggleName: canonicalName !== name ? name : undefined,
      category,
      slot,
      weight,
      dmgNegation,
      resistance,
      setName: engEntry ? engEntry.setName : null,
      setTier: engEntry ? engEntry.setTier : null,
      enginePoise: engEntry ? engEntry.enginePoise : null,
      description: row[iDesc] || null,
      acquisition: null,
    });
  }

  // Engine pieces not in Kaggle — add as stubs so canonical = Kaggle ∪ engine
  const outNames = new Set(out.map(a => a.name));
  for (const engName of engineNames) {
    if (outNames.has(engName)) continue;
    report.enginePiecesNotInKaggle.push(engName);
    const engEntry = engineIndex.get(engName);
    const piece = engEntry.piece;
    out.push({
      name: engName,
      kaggleId: null,
      category: SLOT_TO_CATEGORY[engEntry.slot],
      slot: engEntry.slot,
      weight: piece.w,
      dmgNegation: { phy: piece.p || 0, strike: 0, slash: 0, pierce: 0, magic: piece.m || 0, fire: piece.f || 0, ligt: piece.l || 0, holy: piece.h || 0 },
      resistance: { immunity: 0, robustness: 0, focus: 0, vitality: 0, poise: piece.po || 0 },
      setName: engEntry.setName,
      setTier: engEntry.setTier,
      enginePoise: engEntry.enginePoise,
      description: null,
      acquisition: null,
    });
  }

  report.armorsWritten = out.length;
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B.3.1 ingest report ===');
  console.log(`Armors written: ${report.armorsWritten} (from ${rows.length - 1} Kaggle rows, ${report.dropped} dropped, ${report.duplicates.length} duplicates)`);
  for (const d of report.duplicates) console.log(`  duplicate - ${d.name} (ids: ${d.ids.join(', ')})`);
  console.log(`Engine overlay applied: ${report.engineOverlayApplied}/${engineIndex.size} engine pieces matched`);
  console.log(`Engine pieces not in Kaggle: ${report.enginePiecesNotInKaggle.length}`);
  for (const n of report.enginePiecesNotInKaggle) console.log(`  - ${n}`);
  console.log(`Names normalized to engine canonical: ${report.nameNormalized.length}`);
  for (const m of report.nameNormalized) console.log(`  - "${m.kaggle}" -> "${m.engine}" (${m.kind})`);
  console.log(`Dirty dmgNegation slot names (positional assignment recovered correct values):`);
  for (const [k, c] of Object.entries(report.dirtyNegKeys)) console.log(`  "${k}": ${c} rows`);
  console.log(`Dirty resistance slot names:`);
  for (const [k, c] of Object.entries(report.dirtyResKeys)) console.log(`  "${k}": ${c} rows`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
