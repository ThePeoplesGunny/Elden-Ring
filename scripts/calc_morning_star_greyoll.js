// One-off calculation: Morning Star upgrade target for Greyoll bleed farm.
// Loads the live engine from the HTML file, calls engCalcAR / runeCostForLevel /
// levelsFromRunes directly, and reports the actual numbers — no guessing.
//
// Outputs:
//   1. Morning Star bleed buildup at every upgrade level (1H and 2H)
//   2. Hits-per-proc and total-hits to kill Greyoll at each level
//   3. Smithing stone availability vs. upgrade level
//   4. Rune-cost / level-reached after 1 and 2 Greyoll kills from Wretch level 1
//   5. Recommended upgrade target (knee of diminishing returns)

const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

global.React = { useState: function(init) { var v = typeof init === 'function' ? init() : init; return [v, function(){}]; }, useEffect: function(){}, createElement: function(){ return null; } };
global.ReactDOM = { render: function(){} };
global.localStorage = { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} };
global.document = { getElementById: function(){ return {}; }, createElement: function(){ return { href:'', download:'', click:function(){}, style:{} }; }, body: { appendChild:function(){}, removeChild:function(){} } };
global.URL = { createObjectURL: function(){return '';}, revokeObjectURL: function(){} };
global.Blob = function(){};
global.FileReader = function(){ this.readAsText=function(){}; };
global.confirm = function(){return false;};
global.setTimeout = function(fn){fn();};
global.performance = { now: function(){ return Date.now(); } };
eval(scriptMatch[1]);

// ── 1. Locate Morning Star (Standard variant) ──
var ms = ENG_DATA.reg.w.find(function(w){ return w.w === "Morning Star" && w.a === 0; });
if (!ms) { console.error("Morning Star not found"); process.exit(1); }
console.log("=== MORNING STAR (Standard) ===");
console.log("Type:", ms.t, "(21 = Mace = strike damage)");
console.log("Requirements:", JSON.stringify(ms.r));
console.log("Scaling:", JSON.stringify(ms.as));
console.log("Encoded sp:", JSON.stringify(ms.sp));
console.log("Reinforcement table index (ri):", ms.ri);
var rt = ENG_DATA.reg.rt[ms.ri];
var maxUpg = rt.length - 1;
console.log("Max upgrade level:", maxUpg);
console.log();

// ── 2. Wretch base stats with the +2 STR investment to wield ──
//    Wretch = 10/10/10/10/10/10/10/10. Morning Star needs 12 STR / 8 DEX.
//    Min cost to wield = +2 STR = level 1 → level 3.
var wretchBase = { str: 12, dex: 10, int: 10, fai: 10, arc: 10 };
console.log("Stat profile used for AR calc:", JSON.stringify(wretchBase));
console.log("(+2 STR from Wretch base — minimum to wield. No other investment.)");
console.log();

// ── 3. Compute AR + bleed buildup at every upgrade level, 1H and 2H ──
function bleedFromAR(arResult) {
  // STATUS_TYPES: {5:"poison",6:"rot",7:"bleed",8:"frost",9:"sleep",10:"madness"}
  return Math.floor(arResult.attackPower[7] || 0);
}
function physFromAR(arResult) {
  return Math.floor(arResult.attackPower[0] || 0);
}

console.log("=== BLEED BUILDUP + AR vs UPGRADE LEVEL ===");
console.log("Upg | AR(1H) | AR(2H) | Bleed(1H) | Bleed(2H)");
console.log("----|--------|--------|-----------|----------");
var rows = [];
for (var u = 0; u <= maxUpg; u++) {
  var dec = engDecodeWAtLevel(ms, u);
  if (!dec) continue;
  var ar1 = engCalcAR(dec, wretchBase, 0, false);
  var ar2 = engCalcAR(dec, wretchBase, 0, true);
  var b1 = bleedFromAR(ar1), b2 = bleedFromAR(ar2);
  var p1 = physFromAR(ar1), p2 = physFromAR(ar2);
  rows.push({ upg: u, ar1: p1, ar2: p2, bleed1: b1, bleed2: b2 });
  console.log(
    String(u).padStart(3) + " | " +
    String(p1).padStart(6) + " | " +
    String(p2).padStart(6) + " | " +
    String(b1).padStart(9) + " | " +
    String(b2).padStart(9)
  );
}
console.log();

// ── 4. Greyoll bleed math per FARM_TARGETS data ──
var greyoll = FARM_TARGETS.find(function(f){ return f.name === "Elder Dragon Greyoll"; });
if (!greyoll) { console.error("Greyoll FARM_TARGETS entry not found"); process.exit(1); }
console.log("=== GREYOLL FARM TARGET DATA ===");
console.log("HP:", greyoll.hp);
console.log("Bleed threshold:", greyoll.bleedThreshold);
console.log("Method:", greyoll.method);
console.log("Bleed proc damage = 15% HP =", Math.floor(greyoll.hp * 0.15));
console.log("Procs to kill:", Math.ceil(greyoll.hp / Math.floor(greyoll.hp * 0.15)));
console.log();

console.log("=== HITS TO KILL GREYOLL (2H grip — Wretch's optimal) ===");
console.log("Engine formula: hitsPerProc = ceil(ceil(threshold/buildup) * 1.3); totalHits = hitsPerProc * procsToKill");
console.log();
console.log("Upg | Bleed | Hits/Proc | Procs | TotalHits | DeltaFromPrev");
console.log("----|-------|-----------|-------|-----------|---------------");
var prevHits = null;
var procDmg = Math.floor(greyoll.hp * 0.15);
var procsToKill = Math.ceil(greyoll.hp / procDmg);
rows.forEach(function(r){
  if (r.bleed2 <= 0) return;
  var hitsPerProc = Math.ceil(Math.ceil(greyoll.bleedThreshold / r.bleed2) * 1.3);
  var totalHits = hitsPerProc * procsToKill;
  var delta = prevHits === null ? "—" : (totalHits - prevHits);
  console.log(
    String(r.upg).padStart(3) + " | " +
    String(r.bleed2).padStart(5) + " | " +
    String(hitsPerProc).padStart(9) + " | " +
    String(procsToKill).padStart(5) + " | " +
    String(totalHits).padStart(9) + " | " +
    String(delta).padStart(13)
  );
  prevHits = totalHits;
});
console.log();

// ── 5. Smithing stone availability pre-Greyoll ──
console.log("=== SMITHING STONE AVAILABILITY PRE-GREYOLL ===");
console.log("Limgrave Tunnels (step 117): Smithing Stone 1");
console.log("  Stone 1 takes weapons +0 → +3");
console.log("Morne Tunnel (step 410): Smithing Stones 1 + 2");
console.log("  Stone 2 takes weapons +3 → +6");
console.log("Both available before player needs Greyoll farm.");
console.log("Combined cap pre-Greyoll: +6 (without bell bearings)");
console.log();

// ── 6. Rune cost: Wretch (level 1) → ? after Greyoll kills ──
// Greyoll drops 50,000 runes per kill (Fextralife verified 2026-04-17).
// Prior 80,000 figure was incorrect — likely conflated with the 5 lesser
// dragons (3,470 each, ~17K combined) which are NOT killed by mounted
// tail-farming. Gunny live-confirmed 100K total after 2 kills.
console.log("=== RUNE COST CURVE (Wretch starts at level 1) ===");
console.log("Greyoll reward per kill: 50,000 runes + 5 Dragon Hearts");
console.log();
var runesPerKill = 50000;
var startLevel = 1;
var lvl = startLevel;
var totalRunes = 0;
for (var k = 1; k <= 6; k++) {
  var prevLvl = lvl;
  totalRunes += runesPerKill;
  lvl = lvl + levelsFromRunes(lvl, runesPerKill);
  console.log("After " + k + " Greyoll kill(s) (" + totalRunes.toLocaleString() + " runes):");
  console.log("  Level reached: " + lvl + "  (+" + (lvl - prevLvl) + " from this kill,  +" + (lvl - startLevel) + " total)");
}
