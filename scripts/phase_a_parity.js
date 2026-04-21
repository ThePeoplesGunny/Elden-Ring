// Phase A.5: parity verification.
// Compares the legacy HTML engine (loaded via eval of inline <script>) against
// the extracted tc_next/engine/legacy_bundle.js. Runs a sweep of representative
// engine calls and reports any deltas.
//
// Run: node scripts/phase_a_parity.js

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');

// ---- Load LEGACY engine (via eval of inline HTML script) ----
function loadLegacy() {
  const ctx = {};
  ctx.React = { useState: (i) => [typeof i === 'function' ? i() : i, () => {}], useEffect: () => {}, createElement: () => null };
  ctx.ReactDOM = { render: () => {} };
  ctx.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  ctx.document = { getElementById: () => ({}), createElement: () => ({ href: '', download: '', click: () => {}, style: {} }), body: { appendChild: () => {}, removeChild: () => {} } };
  ctx.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
  ctx.Blob = function () {};
  ctx.FileReader = function () { this.readAsText = () => {}; };
  ctx.confirm = () => false;
  ctx.setTimeout = (fn) => fn();
  ctx.performance = { now: () => Date.now() };
  // Use a sandboxed globalThis copy so legacy doesn't pollute the outer scope
  const vm = require('vm');
  const sandbox = { ...ctx, console, Math, JSON, Object, Array, Number, String, Boolean, Date, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, Map, Set };
  vm.createContext(sandbox);
  const html = fs.readFileSync(path.join(REPO, 'Tarnished_Companion_v3.9.html'), 'utf8');
  const scriptSrc = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(scriptSrc, sandbox, { timeout: 10000 });
  return sandbox;
}

// ---- Load NEW engine module ----
const neu = require(path.join(REPO, 'tc_next', 'engine', 'legacy_bundle.js'));

console.log('Phase A.5 parity verification — legacy HTML vs tc_next/engine/legacy_bundle.js\n');

const legacy = loadLegacy();

// ---- Build a test matrix ----
const tests = [];

// Derived stat curves at sampled points
const samplePoints = [1, 10, 12, 20, 25, 30, 40, 44, 50, 60, 80, 99];
for (const fn of ['engHP', 'engFP', 'engStam', 'engEquip']) {
  for (const v of samplePoints) {
    tests.push({
      label: `${fn}(${v})`,
      legacy: legacy[fn](v),
      neu: neu[fn](v),
    });
  }
}

// Rune cost at sampled levels
for (const l of [2, 10, 13, 20, 41, 50, 75, 100, 125, 250]) {
  tests.push({
    label: `runeCostForLevel(${l})`,
    legacy: legacy.runeCostForLevel(l),
    neu: neu.runeCostForLevel(l),
  });
}

// Defense curve at sampled ratios
for (const r of [0.0, 0.125, 0.5, 1.0, 1.5, 2.5, 3.0, 5.0, 8.0, 10.0]) {
  tests.push({
    label: `engDefenseMult(${r})`,
    legacy: legacy.engDefenseMult(r),
    neu: neu.engDefenseMult(r),
  });
}

// AR on Morning Star +3 across STR range, 1H and 2H
const msLegacy = legacy.ENG_DATA.reg.w.find(w => w.w === 'Morning Star' && w.a === 0);
const msNeu = neu.ENG_DATA.reg.w.find(w => w.w === 'Morning Star' && w.a === 0);
const ms3Legacy = legacy.engDecodeWAtLevel(msLegacy, 3);
const ms3Neu = neu.engDecodeWAtLevel(msNeu, 3);
for (const s of [12, 14, 16, 20, 30, 40, 55, 80]) {
  const stats = { vig: 10, mnd: 10, end: 10, str: s, dex: 10, int: 10, fai: 10, arc: 10 };
  for (const twoH of [false, true]) {
    const gL = legacy.engCalcAR(ms3Legacy, stats, 0, twoH);
    const gN = neu.engCalcAR(ms3Neu, stats, 0, twoH);
    tests.push({
      label: `MS+3 AR STR ${s} ${twoH ? '2H' : '1H'}`,
      legacy: gL ? Math.floor(gL.attackPower[0]) : null,
      neu: gN ? Math.floor(gN.attackPower[0]) : null,
    });
  }
}

// Damage vs Margit at several weapon+stat combos
const margitLegacy = legacy.ENG_DATA.bosses.find(b => b.ph && b.ph[0] && b.ph[0].n.indexOf('Margit') >= 0);
const margitNeu = neu.ENG_DATA.bosses.find(b => b.ph && b.ph[0] && b.ph[0].n.indexOf('Margit') >= 0);
for (const s of [14, 20, 40]) {
  const stats = { vig: 40, mnd: 10, end: 15, str: s, dex: 10, int: 10, fai: 10, arc: 10 };
  const arL = legacy.engCalcAR(ms3Legacy, stats, 0, true);
  const arN = neu.engCalcAR(ms3Neu, stats, 0, true);
  const dL = legacy.engDmgVsBoss(arL, margitLegacy, ms3Legacy.weaponType);
  const dN = neu.engDmgVsBoss(arN, margitNeu, ms3Neu.weaponType);
  tests.push({
    label: `vs Margit dmg STR ${s} 2H`,
    legacy: Math.round(dL.total),
    neu: Math.round(dN.total),
  });
}

// Discovery curve (not a wrapped function, just data lookup)
for (const a of [1, 10, 20, 55, 80, 99]) {
  tests.push({
    label: `Discovery(ARC ${a})`,
    legacy: legacy.ENG_DATA.derivedStats.discovery.values[String(a)],
    neu: neu.ENG_DATA.derivedStats.discovery.values[String(a)],
  });
}

// ---- Report ----
let pass = 0, fail = 0;
for (const t of tests) {
  const eq = t.legacy === t.neu || (
    typeof t.legacy === 'number' && typeof t.neu === 'number' &&
    Math.abs(t.legacy - t.neu) < 1e-9
  );
  if (eq) {
    pass++;
  } else {
    fail++;
    console.log(`  FAIL  ${t.label.padEnd(32)}  legacy=${t.legacy}  new=${t.neu}`);
  }
}
console.log(`\n${pass} pass / ${fail} fail / ${tests.length} total`);
console.log(fail === 0 ? 'PARITY VERIFIED — legacy HTML and tc_next bundle are behaviorally identical.' : 'PARITY BROKEN — see failures above.');
process.exit(fail === 0 ? 0 : 1);
