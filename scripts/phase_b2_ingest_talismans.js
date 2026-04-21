#!/usr/bin/env node
// Phase B.2.1 — deliton/talismans.json + tc_next/data/talismans_engine.json
// → data/talismans.json
//
// Deliton provides 87 base rows (name, description, prose effect).
// Engine overlays weight + structured effect/value/note for 41 curated talismans.
// Fextralife acquisition overlay is a separate script.

const fs = require('fs');
const path = require('path');

const DELITON_PATH = path.join(__dirname, '..', 'data', 'deliton_json', 'talismans.json');
const ENGINE_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'talismans_engine.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'talismans.json');

// Manual deliton→engine name corrections beyond case-only. Filled in after first run if needed.
const NAME_CORRECTIONS = {};

const report = {
  talismansWritten: 0,
  duplicates: [],
  nameNormalized: [],
  engineOverlayApplied: 0,
  engineOnlyNotInDeliton: [],
};

function main() {
  const deliton = JSON.parse(fs.readFileSync(DELITON_PATH, 'utf8'));
  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));
  const engineLower = new Map(engine.map(e => [e.name.toLowerCase(), e]));

  const seen = new Map();
  const out = [];

  for (const t of deliton) {
    if (seen.has(t.name)) {
      report.duplicates.push({ name: t.name, ids: [seen.get(t.name).id, t.id] });
      continue;
    }
    seen.set(t.name, t);

    let canonicalName = t.name;
    if (NAME_CORRECTIONS[t.name]) {
      canonicalName = NAME_CORRECTIONS[t.name];
      report.nameNormalized.push({ deliton: t.name, engine: canonicalName, kind: 'manual' });
    } else {
      const engMatch = engineLower.get(t.name.toLowerCase());
      if (engMatch && engMatch.name !== t.name) {
        canonicalName = engMatch.name;
        report.nameNormalized.push({ deliton: t.name, engine: canonicalName, kind: 'case' });
      }
    }

    const engEntry = engineLower.get(canonicalName.toLowerCase());
    if (engEntry) report.engineOverlayApplied++;

    out.push({
      name: canonicalName,
      delitonId: t.id,
      delitonName: canonicalName !== t.name ? t.name : undefined,
      description: t.description,
      effect: t.effect,
      weight: engEntry ? engEntry.weight : null,
      engineEffect: engEntry ? engEntry.effect : null,
      engineValue: engEntry ? engEntry.value : null,
      engineNote: engEntry ? engEntry.note : null,
      effectPrecise: null,
      effectCategory: null,
      stackingRule: null,
      acquisition: null,
    });
  }

  // For engine talismans not in deliton, add engine-only stubs so canonical
  // is a proper union (deliton ∪ engine). Fextralife merge can then hit them.
  const outNames = new Set(out.map(t => t.name));
  for (const e of engine) {
    if (outNames.has(e.name)) continue;
    report.engineOnlyNotInDeliton.push(e.name);
    out.push({
      name: e.name,
      delitonId: null,
      description: null,
      effect: null,
      weight: e.weight,
      engineEffect: e.effect,
      engineValue: e.value,
      engineNote: e.note,
      effectPrecise: null,
      effectCategory: null,
      stackingRule: null,
      acquisition: null,
    });
  }

  report.talismansWritten = out.length;
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  console.log('=== Phase B.2.1 ingest report ===');
  console.log(`Talismans written: ${report.talismansWritten} (deliton ${deliton.length} + engine-only ${report.engineOnlyNotInDeliton.length})`);
  console.log(`Duplicates dropped: ${report.duplicates.length}`);
  for (const d of report.duplicates) console.log(`  - ${d.name} (ids: ${d.ids.join(', ')})`);
  console.log(`Engine overlay applied: ${report.engineOverlayApplied}/${engine.length}`);
  console.log(`Names normalized to engine canonical: ${report.nameNormalized.length}`);
  for (const m of report.nameNormalized) console.log(`  - "${m.deliton}" -> "${m.engine}" (${m.kind})`);
  console.log(`Engine entries not matched in deliton: ${report.engineOnlyNotInDeliton.length}`);
  for (const n of report.engineOnlyNotInDeliton) console.log(`  - ${n}`);
  console.log(`Output: ${OUT_PATH}`);
}

main();
