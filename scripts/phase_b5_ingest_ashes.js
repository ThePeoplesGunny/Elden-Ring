#!/usr/bin/env node
// Phase B.5.1 — Kaggle ashes.csv + tc_next/data/ashes_of_war.json
// → data/ashes_of_war.json
//
// Kaggle shape: 90 rows with name="Ash Of War: <Skill>", skill, affinity, description.
// Engine shape: 15 curated (skill, affinity) combos with damage math.
// Match by skill name (stripped of parenthetical qualifiers like "(Heavy)", "(AoW)").
//
// No Fextralife AoW harvest exists — all rows acquisition: null.
// Name normalization: "Ash Of War:" → "Ash of War:" (game convention is lowercase of).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KAGGLE_PATH = path.join(ROOT, 'data', 'kaggle', 'ashes.csv');
const ENGINE_PATH = path.join(ROOT, 'tc_next', 'data', 'ashes_of_war.json');
const OUT_PATH = path.join(ROOT, 'data', 'ashes_of_war.json');

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

function stripParenthetical(s) {
  return s.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function main() {
  const rows = parseCSV(fs.readFileSync(KAGGLE_PATH, 'utf8'));
  const header = rows[0];
  const iId = header.indexOf('id');
  const iName = header.indexOf('name');
  const iDesc = header.indexOf('description');
  const iAffinity = header.indexOf('affinity');
  const iSkill = header.indexOf('skill');

  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));
  const engineBySkill = new Map();
  for (const e of engine) {
    const bareSkill = stripParenthetical(e.name);
    engineBySkill.set(bareSkill.toLowerCase(), e);
  }

  const seen = new Map();
  const out = [];
  const report = {
    duplicates: [],
    nameNormalized: [],
    prefixAdded: [],
    excluded: [],
    engineOverlayApplied: 0,
    engineOnlyStubs: [],
  };

  // Excluded: Kaggle includes "Lost Ashes of War" in ashes.csv but it's
  // a consumable crafting token, not an AoW. Re-home in items.json (B.7).
  const EXCLUDED = new Set(['Lost Ashes Of War']);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[iName]) continue;
    const kaggleName = row[iName];
    if (EXCLUDED.has(kaggleName)) {
      report.excluded.push({ name: kaggleName, reason: 'not an AoW — consumable crafting token, defer to B.7 items' });
      continue;
    }
    if (seen.has(kaggleName)) {
      report.duplicates.push({ name: kaggleName, ids: [seen.get(kaggleName), row[iId]] });
      continue;
    }
    seen.set(kaggleName, row[iId]);

    // Normalize prefix variants to canonical "Ash of War:" (game convention):
    //   "Ash Of War:" (capital O)    → "Ash of War:"
    //   "Ashes Of War:" (plural typo) → "Ash of War:"
    // Add missing prefix for AoWs that Kaggle listed bare ("Through and Through"):
    let canonicalName = kaggleName
      .replace(/^Ashes Of War:/i, 'Ash of War:')
      .replace(/^Ash Of War:/, 'Ash of War:');

    if (!/^Ash of War:/i.test(canonicalName)) {
      // Prefer skill field for the bare name (has correct lowercase)
      const bareName = row[iSkill] || canonicalName;
      canonicalName = `Ash of War: ${bareName}`;
      report.prefixAdded.push({ kaggle: kaggleName, canonical: canonicalName });
    } else if (canonicalName !== kaggleName) {
      report.nameNormalized.push({ kaggle: kaggleName, canonical: canonicalName });
    }

    const skill = row[iSkill] || null;
    const engEntry = skill ? engineBySkill.get(skill.toLowerCase()) : null;
    if (engEntry) report.engineOverlayApplied++;

    out.push({
      name: canonicalName,
      kaggleId: row[iId],
      kaggleName: canonicalName !== kaggleName ? kaggleName : undefined,
      skill,
      defaultAffinity: row[iAffinity] || null,
      engineDamageType: engEntry ? engEntry.type : null,
      engineDmgMult: engEntry ? engEntry.dmgMult : null,
      engineFpCost: engEntry ? engEntry.fpCost : null,
      engineCastTime: engEntry ? engEntry.castTime : null,
      engineTier: engEntry ? engEntry.tier : null,
      walkthroughStep: engEntry ? engEntry.step : null,
      engineNote: engEntry ? engEntry.note : null,
      description: row[iDesc] || null,
      acquisition: null,
    });
  }

  // Engine-only AoWs not represented in Kaggle (match by skill)
  const outSkills = new Set(out.map(a => (a.skill || '').toLowerCase()).filter(Boolean));
  for (const e of engine) {
    const bareSkill = stripParenthetical(e.name);
    if (outSkills.has(bareSkill.toLowerCase())) continue;
    report.engineOnlyStubs.push(e.name);
    out.push({
      name: `Ash of War: ${bareSkill}`,
      kaggleId: null,
      skill: bareSkill,
      defaultAffinity: null,
      engineDamageType: e.type,
      engineDmgMult: e.dmgMult,
      engineFpCost: e.fpCost,
      engineCastTime: e.castTime,
      engineTier: e.tier,
      walkthroughStep: e.step,
      engineNote: e.note,
      description: null,
      acquisition: null,
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B.5.1 ingest report ===');
  console.log(`Ashes written: ${out.length}`);
  console.log(`  ${rows.length - 1} Kaggle - ${report.excluded.length} excluded - ${report.duplicates.length} duplicates + ${report.engineOnlyStubs.length} engine-only`);
  console.log(`Excluded (not AoWs): ${report.excluded.length}`);
  for (const e of report.excluded) console.log(`  - ${e.name} — ${e.reason}`);
  console.log(`Duplicates: ${report.duplicates.length}`);
  for (const d of report.duplicates) console.log(`  - ${d.name} (${d.ids.join(', ')})`);
  console.log(`Name normalized (case/plural fix): ${report.nameNormalized.length}`);
  console.log(`Prefix added (bare skill name): ${report.prefixAdded.length}`);
  for (const p of report.prefixAdded) console.log(`  - "${p.kaggle}" -> "${p.canonical}"`);
  console.log(`Engine overlay applied: ${report.engineOverlayApplied}/${engine.length}`);
  console.log(`Engine-only stubs: ${report.engineOnlyStubs.length}`);
  for (const n of report.engineOnlyStubs) console.log(`  - ${n}`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
