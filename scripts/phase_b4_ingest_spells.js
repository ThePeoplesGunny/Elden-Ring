#!/usr/bin/env node
// Phase B.4.1 — Kaggle sorceries.csv + incantations.csv
//                + tc_next/data/sorceries_engine.json + incantations_engine.json
//                + spell_dmg.json + spell_step.json
// → data/sorceries.json + data/incantations.json
//
// Spells share schema across both catalogs. Single ingest pass writes both
// canonical files with unified shape. Consumers can distinguish via `catalog`.
//
// Engine overlays contribute: school, damageType (engine's `type`), chargeAble,
// engineNote, normalized requirements.
// spell_dmg.json contributes: motionValue, castTime.
// spell_step.json contributes: walkthroughStep.
// No Fextralife spell harvest exists — acquisition: null on all.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = {
  Sorcery: path.join(ROOT, 'data', 'sorceries.json'),
  Incantation: path.join(ROOT, 'data', 'incantations.json'),
};

const CATALOG_NORMALIZE = {
  Sorceries: 'Sorcery',
  Sorcery: 'Sorcery',
  Incantations: 'Incantation',
  Incantation: 'Incantation',
};

const REQ_KEY = {
  Strength: 'str',
  Dexterity: 'dex',
  Intelligence: 'int',
  Faith: 'fai',
  Arcane: 'arc',
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
  return JSON.parse(s.replace(/'/g, '"'));
}

function normalizeRequirements(arr) {
  const out = { str: 0, dex: 0, int: 0, fai: 0, arc: 0 };
  for (const entry of arr || []) {
    const k = REQ_KEY[entry.name];
    if (k) out[k] = Number(entry.amount) || 0;
  }
  return out;
}

function ingest(csvFile, catalogLabel, engineData, spellDmg, spellStep, engineLower, report) {
  const rows = parseCSV(fs.readFileSync(path.join(ROOT, 'data', 'kaggle', csvFile), 'utf8'));
  const header = rows[0];
  const iId = header.indexOf('id');
  const iName = header.indexOf('name');
  const iDesc = header.indexOf('description');
  const iType = header.indexOf('type');
  const iCost = header.indexOf('cost');
  const iSlots = header.indexOf('slots');
  const iEffects = header.indexOf('effects');
  const iReq = header.indexOf('requires');

  const seen = new Map();
  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[iName]) continue;
    const kaggleName = row[iName];
    if (seen.has(kaggleName)) {
      report.duplicates[catalogLabel].push({ name: kaggleName, ids: [seen.get(kaggleName), row[iId]] });
      continue;
    }
    seen.set(kaggleName, row[iId]);

    let canonicalName = kaggleName;
    const engCanonical = engineLower.get(kaggleName.toLowerCase());
    if (engCanonical && engCanonical.name !== kaggleName) {
      canonicalName = engCanonical.name;
      report.nameNormalized[catalogLabel].push({ kaggle: kaggleName, engine: canonicalName });
    }

    const catalog = CATALOG_NORMALIZE[row[iType]] || row[iType];
    const engEntry = engineLower.get(canonicalName.toLowerCase());
    if (engEntry) report.engineOverlayApplied[catalogLabel]++;

    let requirements;
    try {
      requirements = normalizeRequirements(parsePyArray(row[iReq] || '[]'));
    } catch (e) {
      requirements = { str: 0, dex: 0, int: 0, fai: 0, arc: 0 };
    }

    // Engine req is more authoritative if present (e.g., engine explicitly encodes int=10)
    if (engEntry && engEntry.req) {
      for (const k of Object.keys(requirements)) {
        if (engEntry.req[k] && engEntry.req[k] !== requirements[k]) {
          report.reqDrift[catalogLabel].push({
            name: canonicalName,
            stat: k,
            kaggle: requirements[k],
            engine: engEntry.req[k],
          });
        }
      }
    }

    const dmg = spellDmg[canonicalName];
    const step = spellStep[canonicalName];

    out.push({
      name: canonicalName,
      kaggleId: row[iId],
      kaggleName: canonicalName !== kaggleName ? kaggleName : undefined,
      catalog,
      school: engEntry ? engEntry.school : null,
      damageType: engEntry ? engEntry.type : null,
      fp: Number(row[iCost]) || 0,
      slots: Number(row[iSlots]) || 0,
      requirements,
      chargeAble: engEntry ? engEntry.chargeAble : null,
      motionValue: dmg ? dmg.dmg : null,
      castTime: dmg ? dmg.castTime : null,
      walkthroughStep: step != null ? step : null,
      description: row[iDesc] || null,
      effect: row[iEffects] || null,
      engineNote: engEntry ? engEntry.notes : null,
      acquisition: null,
    });
  }

  // Add engine-only entries as stubs
  const outNames = new Set(out.map(s => s.name));
  for (const e of engineData) {
    if (outNames.has(e.name)) continue;
    report.engineOnlyStubs[catalogLabel].push(e.name);
    const dmg = spellDmg[e.name];
    const step = spellStep[e.name];
    out.push({
      name: e.name,
      kaggleId: null,
      catalog: catalogLabel,
      school: e.school,
      damageType: e.type,
      fp: e.fp,
      slots: e.slots,
      requirements: {
        str: e.req?.str || 0,
        dex: e.req?.dex || 0,
        int: e.req?.int || 0,
        fai: e.req?.fai || 0,
        arc: e.req?.arc || 0,
      },
      chargeAble: e.chargeAble,
      motionValue: dmg ? dmg.dmg : null,
      castTime: dmg ? dmg.castTime : null,
      walkthroughStep: step != null ? step : null,
      description: null,
      effect: null,
      engineNote: e.notes,
      acquisition: null,
    });
  }

  fs.writeFileSync(OUT[catalogLabel], JSON.stringify(out, null, 2));
  return out;
}

function main() {
  const spellDmg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tc_next', 'data', 'spell_dmg.json'), 'utf8'));
  const spellStep = JSON.parse(fs.readFileSync(path.join(ROOT, 'tc_next', 'data', 'spell_step.json'), 'utf8'));
  const sorceriesEng = JSON.parse(fs.readFileSync(path.join(ROOT, 'tc_next', 'data', 'sorceries_engine.json'), 'utf8'));
  const incantsEng = JSON.parse(fs.readFileSync(path.join(ROOT, 'tc_next', 'data', 'incantations_engine.json'), 'utf8'));

  const sorLower = new Map(sorceriesEng.map(e => [e.name.toLowerCase(), e]));
  const incLower = new Map(incantsEng.map(e => [e.name.toLowerCase(), e]));

  const report = {
    duplicates: { Sorcery: [], Incantation: [] },
    nameNormalized: { Sorcery: [], Incantation: [] },
    engineOverlayApplied: { Sorcery: 0, Incantation: 0 },
    engineOnlyStubs: { Sorcery: [], Incantation: [] },
    reqDrift: { Sorcery: [], Incantation: [] },
  };

  const sorceries = ingest('sorceries.csv', 'Sorcery', sorceriesEng, spellDmg, spellStep, sorLower, report);
  const incantations = ingest('incantations.csv', 'Incantation', incantsEng, spellDmg, spellStep, incLower, report);

  console.log('=== Phase B.4.1 ingest report ===');
  for (const cat of ['Sorcery', 'Incantation']) {
    const arr = cat === 'Sorcery' ? sorceries : incantations;
    const engCount = cat === 'Sorcery' ? sorceriesEng.length : incantsEng.length;
    console.log(`\n[${cat}] ${arr.length} canonical (engine ${engCount} overlay ${report.engineOverlayApplied[cat]}, +${report.engineOnlyStubs[cat].length} engine-only stubs)`);
    console.log(`  duplicates: ${report.duplicates[cat].length}`);
    for (const d of report.duplicates[cat]) console.log(`    - ${d.name} (${d.ids.join(', ')})`);
    console.log(`  name normalized: ${report.nameNormalized[cat].length}`);
    for (const n of report.nameNormalized[cat]) console.log(`    - "${n.kaggle}" -> "${n.engine}"`);
    console.log(`  engine-only stubs: ${report.engineOnlyStubs[cat].length}`);
    for (const n of report.engineOnlyStubs[cat]) console.log(`    - ${n}`);
    console.log(`  requirement drift (kaggle vs engine): ${report.reqDrift[cat].length}`);
    for (const d of report.reqDrift[cat]) console.log(`    - ${d.name} ${d.stat}: kaggle ${d.kaggle} vs engine ${d.engine}`);
  }
  console.log(`\nOutputs: ${OUT.Sorcery}, ${OUT.Incantation}`);
}

main();
