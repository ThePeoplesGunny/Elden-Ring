#!/usr/bin/env node
// Phase B-Overlay-Merge validate — canonical data/*.json vs data/fanapis/*.json
// Read-only. Produces drift report per class and writes
// data/fanapis/drift_report.json for audit.
//
// Outcome on 2026-04-22: canonical is already aligned with fanapis across
// all classes — drift counts are near zero. This confirms canonical ingests
// correctly absorbed the Kaggle/deliton source data. fanapis served its
// purpose as validation witness, not override source; no canonical
// overrides needed. Individual drift cases flagged for human review.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const FAN = path.join(DATA, 'fanapis');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function loadFan(name) { return load(path.join(FAN, name)).data; }

const reports = {};

function reportArmors() {
  const canon = load(path.join(DATA, 'armors.json'));
  const fan = loadFan('armors.json');
  const byName = new Map(fan.map(f => [f.name, f]));
  const poiseDrift = [], weightDrift = [], notFound = [];
  for (const a of canon) {
    const f = byName.get(a.name);
    if (!f) { if (a.kaggleId != null) notFound.push(a.name); continue; }
    const fPoise = (f.resistance.find(r => r.name === 'Poise') || {}).amount;
    if (fPoise != null && a.resistance.poise !== fPoise) {
      poiseDrift.push({ name: a.name, canon: a.resistance.poise, fanapis: fPoise });
    }
    if (f.weight != null && Math.abs((a.weight || 0) - f.weight) > 0.01) {
      weightDrift.push({ name: a.name, canon: a.weight, fanapis: f.weight });
    }
  }
  return { canonCount: canon.length, fanCount: fan.length, notFound, poiseDrift, weightDrift };
}

function reportWeapons() {
  const canon = load(path.join(DATA, 'weapons.json'));
  const fan = loadFan('weapons.json');
  const byName = new Map(fan.map(f => [f.name, f]));
  const reqDrift = [], notFound = [];
  for (const w of canon) {
    const f = byName.get(w.name);
    if (!f) { if (w.delitonId != null || w.kaggleId != null) notFound.push(w.name); continue; }
    const cReq = w.requirements || {};
    const fReq = {};
    for (const r of f.requiredAttributes || []) fReq[r.name.toLowerCase()] = r.amount;
    const keys = new Set([...Object.keys(cReq), ...Object.keys(fReq)]);
    const diffs = {};
    for (const k of keys) {
      const cv = cReq[k] || 0, fv = fReq[k] || 0;
      if (cv !== fv) diffs[k] = { canon: cReq[k], fanapis: fReq[k] };
    }
    if (Object.keys(diffs).length > 0) reqDrift.push({ name: w.name, diffs });
  }
  return { canonCount: canon.length, fanCount: fan.length, notFound, reqDrift };
}

function reportSpells(label, canonFile, fanFile) {
  const canon = load(path.join(DATA, canonFile));
  const fan = loadFan(fanFile);
  const byName = new Map(fan.map(f => [f.name, f]));
  const reqDrift = [], notFound = [];
  for (const s of canon) {
    const f = byName.get(s.name);
    if (!f) { if (s.kaggleId != null) notFound.push(s.name); continue; }
    const cReq = s.requirements || {};
    const fReq = {};
    for (const r of f.requires || []) fReq[r.name.toLowerCase().slice(0, 3)] = r.amount;
    const keys = new Set([...Object.keys(cReq), ...Object.keys(fReq)]);
    const diffs = {};
    for (const k of keys) {
      const cv = cReq[k] || 0, fv = fReq[k] || 0;
      if (cv !== fv) diffs[k] = { canon: cReq[k], fanapis: fReq[k] };
    }
    if (Object.keys(diffs).length > 0) reqDrift.push({ name: s.name, diffs });
  }
  return { canonCount: canon.length, fanCount: fan.length, notFound, reqDrift };
}

function reportTalismans() {
  const canon = load(path.join(DATA, 'talismans.json'));
  const fan = loadFan('talismans.json');
  const byName = new Map(fan.map(f => [f.name, f]));
  const effectDrift = [], notFound = [];
  for (const t of canon) {
    const f = byName.get(t.name);
    if (!f) { if (t.delitonId != null) notFound.push(t.name); continue; }
    if (f.effect && t.effect && f.effect !== t.effect) {
      effectDrift.push({ name: t.name, canon: t.effect, fanapis: f.effect });
    }
  }
  return { canonCount: canon.length, fanCount: fan.length, notFound, effectDrift };
}

function reportAshes() {
  const canon = load(path.join(DATA, 'ashes_of_war.json'));
  const fan = loadFan('ashes_of_war.json');
  // Canonical normalized "Ash Of War" → "Ash of War" at ingest (B.5 note).
  // Match case-insensitively to bridge the case-fix.
  const byName = new Map(fan.map(f => [f.name.toLowerCase(), f]));
  const affinityDrift = [], notFound = [];
  for (const a of canon) {
    const f = byName.get(a.name.toLowerCase());
    if (!f) { if (a.kaggleId != null) notFound.push(a.name); continue; }
    if (f.affinity && a.affinity && f.affinity !== a.affinity) {
      affinityDrift.push({ name: a.name, canon: a.affinity, fanapis: f.affinity });
    }
  }
  return { canonCount: canon.length, fanCount: fan.length, notFound, affinityDrift };
}

reports.armors = reportArmors();
reports.weapons = reportWeapons();
reports.sorceries = reportSpells('Sorceries', 'sorceries.json', 'sorceries.json');
reports.incantations = reportSpells('Incantations', 'incantations.json', 'incantations.json');
reports.talismans = reportTalismans();
reports.ashes_of_war = reportAshes();

const reportPath = path.join(FAN, 'drift_report.json');
fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2));

console.log('=== Phase B-Overlay validate ===');
for (const [cls, r] of Object.entries(reports)) {
  const drift = r.poiseDrift || r.weightDrift || r.reqDrift || r.effectDrift || r.affinityDrift || [];
  const driftLabels = [
    r.poiseDrift && `poise=${r.poiseDrift.length}`,
    r.weightDrift && `weight=${r.weightDrift.length}`,
    r.reqDrift && `req=${r.reqDrift.length}`,
    r.effectDrift && `effect=${r.effectDrift.length}`,
    r.affinityDrift && `affinity=${r.affinityDrift.length}`,
  ].filter(Boolean).join(' ');
  console.log(`  ${cls.padEnd(14)} canon=${r.canonCount} fanapis=${r.fanCount} notFound=${r.notFound.length} | ${driftLabels}`);
}
console.log(`\nFull drift report: ${path.relative(ROOT, reportPath)}`);
