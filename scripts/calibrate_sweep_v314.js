// v3.14 Phase 0 full calibration sweep — all 8 attributes vs engine
// Wretch L3, Morning Star +3 equipped, 150K unspent runes
// Engine outputs vs in-game level-up preview. Tolerance: |Δ| ≤ 1.
//
// Gunny current state (L3 Wretch): VIG/MND/END/DEX/INT/FAI/ARC=10, STR=12.
// (L3 = base 80 + 2 points; 2 points went into STR to meet Morning Star req.)
// For each attribute test: raise ONLY that attribute above its current baseline,
// all others stay at their current values. Back out of the menu after each read — no commits.

const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
global.React = { useState: i => [typeof i==='function'?i():i,()=>{}], useEffect: ()=>{}, createElement: ()=>null };
global.ReactDOM = { render: ()=>{} };
global.localStorage = { getItem: ()=>null, setItem: ()=>{}, removeItem: ()=>{} };
global.document = { getElementById: ()=>({}), createElement: ()=>({href:'',download:'',click:()=>{},style:{}}), body:{appendChild:()=>{},removeChild:()=>{}} };
global.URL = { createObjectURL: ()=>'', revokeObjectURL: ()=>{} };
global.Blob = function(){};
global.FileReader = function(){this.readAsText=()=>{};};
global.confirm = ()=>false;
global.setTimeout = fn=>fn();
global.performance = { now: ()=>Date.now() };
eval(scriptMatch[1]);

// Discovery lookup — engine has data but no wrapper function
function engDiscovery(arc) {
  const t = ENG_DATA.derivedStats.discovery.values;
  const keys = Object.keys(t).map(Number).sort((a,b)=>a-b);
  if (arc <= keys[0]) return t[keys[0]];
  if (arc >= keys[keys.length-1]) return t[keys[keys.length-1]];
  for (let i=0;i<keys.length-1;i++){
    if (arc>=keys[i] && arc<=keys[i+1]){
      const r=(arc-keys[i])/(keys[i+1]-keys[i]);
      return Math.round(t[keys[i]]+(t[keys[i+1]]-t[keys[i]])*r);
    }
  }
  return t[keys[keys.length-1]];
}

// Morning Star +3 decode
const ms = ENG_DATA.reg.w.find(w => w.w === "Morning Star" && w.a === 0);
const ms3 = engDecodeWAtLevel(ms, 3);

// Build stat object helper — baseline matches Gunny's current L3 Wretch state (STR=12)
function S(overrides) {
  return Object.assign({ vig:10, mnd:10, end:10, str:12, dex:10, int:10, fai:10, arc:10 }, overrides);
}

// Test point grid per attribute (baseline = current, then pre-softcap / softcap / post-softcap)
const GRID = {
  VIG: [10, 25, 40, 60],
  MND: [10, 25, 40, 55],
  END: [10, 20, 30, 50],
  STR: [12, 20, 55, 80],   // baseline STR=12 (req-met), not 10
  DEX: [10, 20, 55, 80],
  INT: [10, 20, 50, 80],
  FAI: [10, 20, 50, 80],
  ARC: [10, 20, 55, 80],
};

function hdr(title) {
  console.log("\n## " + title);
}
function row(cells) {
  console.log("| " + cells.join(" | ") + " |");
}
function sep(n) {
  const cells = [];
  for (let i=0;i<n;i++) cells.push("---");
  row(cells);
}

// ===== STAT-DERIVED TABLES =====

hdr("VIG sweep — HP");
row(["VIG", "Engine HP", "In-game HP", "Δ"]);
sep(4);
for (const v of GRID.VIG) row([v, engHP(v), "", ""]);

hdr("MND sweep — FP");
row(["MND", "Engine FP", "In-game FP", "Δ"]);
sep(4);
for (const m of GRID.MND) row([m, engFP(m), "", ""]);

hdr("END sweep — Stamina + Equip Load");
row(["END", "Engine Stam", "In-game Stam", "Δ Stam", "Engine EquipLoad", "In-game EquipLoad", "Δ EL"]);
sep(7);
for (const e of GRID.END) row([e, engStam(e), "", "", engEquip(e).toFixed(1), "", ""]);

hdr("ARC sweep — Discovery");
row(["ARC", "Engine Discovery", "In-game Discovery", "Δ"]);
sep(4);
for (const a of GRID.ARC) row([a, engDiscovery(a), "", ""]);

// ===== WEAPON-DEPENDENT: Morning Star +3 AR =====
// Physical AR is the primary read. Column 0 = physical damage.
// Bleed buildup (column 7) is secondary but visible in-game as status bar.

hdr("STR sweep — Morning Star +3 AR (DEX/INT/FAI/ARC at 10)");
row(["STR", "1H Engine Phys AR", "In-game 1H AR", "Δ", "2H Engine Phys AR", "In-game 2H AR", "Δ"]);
sep(7);
for (const s of GRID.STR) {
  const stats = S({ str:s });
  const ar1h = engCalcAR(ms3, stats, 0, false);
  const ar2h = engCalcAR(ms3, stats, 0, true);
  // Morning Star requires STR 9 — 10 base meets it. At STR<9, engCalcAR returns null.
  const p1 = ar1h ? Math.floor(ar1h.attackPower[0]) : "REQ";
  const p2 = ar2h ? Math.floor(ar2h.attackPower[0]) : "REQ";
  row([s, p1, "", "", p2, "", ""]);
}

hdr("DEX sweep — Morning Star +3 AR (STR at 10, INT/FAI/ARC at 10)");
row(["DEX", "1H Engine Phys AR", "In-game 1H AR", "Δ", "1H Engine Bleed", "In-game Bleed", "Δ"]);
sep(7);
for (const d of GRID.DEX) {
  const stats = S({ dex:d });
  const ar1h = engCalcAR(ms3, stats, 0, false);
  const phys = ar1h ? Math.floor(ar1h.attackPower[0]) : "REQ";
  const bleed = ar1h ? Math.floor(ar1h.attackPower[7]) : "REQ";
  row([d, phys, "", "", bleed, "", ""]);
}

hdr("ARC sweep — Morning Star +3 Bleed buildup (STR/DEX at 10)");
row(["ARC", "1H Engine Phys AR", "In-game 1H AR", "Δ", "1H Engine Bleed", "In-game Bleed", "Δ"]);
sep(7);
for (const a of GRID.ARC) {
  const stats = S({ arc:a });
  const ar1h = engCalcAR(ms3, stats, 0, false);
  const phys = ar1h ? Math.floor(ar1h.attackPower[0]) : "REQ";
  const bleed = ar1h ? Math.floor(ar1h.attackPower[7]) : "REQ";
  row([a, phys, "", "", bleed, "", ""]);
}

// ===== NULL SCANS: INT/FAI should not affect Morning Star AR =====
hdr("INT null scan — Morning Star has no INT scaling (expect NO change across test points)");
row(["INT", "1H Engine Phys AR", "In-game 1H AR", "Δ (expect 0)"]);
sep(4);
for (const i of GRID.INT) {
  const stats = S({ int:i });
  const ar1h = engCalcAR(ms3, stats, 0, false);
  const p = ar1h ? Math.floor(ar1h.attackPower[0]) : "REQ";
  row([i, p, "", ""]);
}

hdr("FAI null scan — Morning Star has no FAI scaling (expect NO change across test points)");
row(["FAI", "1H Engine Phys AR", "In-game 1H AR", "Δ (expect 0)"]);
sep(4);
for (const f of GRID.FAI) {
  const stats = S({ fai:f });
  const ar1h = engCalcAR(ms3, stats, 0, false);
  const p = ar1h ? Math.floor(ar1h.attackPower[0]) : "REQ";
  row([f, p, "", ""]);
}

// ===== UNMODELED (flag, don't invent) =====
hdr("UNMODELED — engine has NO function for these; record in-game values for gap analysis");
console.log(`
The engine currently models only HP/FP/Stamina/Equip Load/Discovery as stat-derived lookups,
and AR as a weapon function. The following in-game displays are VISIBLE on the stat screen
but NOT in the engine. Record them anyway — if a pattern emerges, we add engine coverage in a
future revision.

Per attribute, note which of these change when you raise the attribute:

- VIG: Immunity, Fire Defense
- MND: Focus
- END: Robustness, Physical Defense (all 4 subtypes)
- STR: Physical Defense, Attack Power displayed in equipment
- DEX: Robustness, Fall damage reduction (not on stat screen), Cast speed (not on stat screen)
- INT: Magic Defense, Vitality
- FAI: Fire/Holy/Lightning Defense, Vitality, Focus
- ARC: Immunity, Vitality, status buildup scaling on weapons

Record format: attribute_at_testpoint → {stat screen diff vs baseline}.
Example: VIG 40 → Immunity +85, Fire Def +12. We'll compare across test points after.
`);
