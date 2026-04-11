// Compute the exact post-upgrade state for Phase 0 step 39:
// Morning Star +3 at 12 STR / 10 DEX, Wretch at level 3, rune cost to get there.

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

// Rune cost: Wretch level 1 → 3 (2 STR investments)
var cost1to2 = runeCostForLevel(2);
var cost2to3 = runeCostForLevel(3);
var total = cost1to2 + cost2to3;
console.log("=== RUNE COST: Wretch level 1 → 3 (2× STR) ===");
console.log("Level 1 → 2:", cost1to2, "runes");
console.log("Level 2 → 3:", cost2to3, "runes");
console.log("Total:", total, "runes");
console.log();

// Morning Star +3 at 12/10/10/10/10, 1H and 2H
var ms = ENG_DATA.reg.w.find(function(w){ return w.w === "Morning Star" && w.a === 0; });
var stats = { str:12, dex:10, int:10, fai:10, arc:10 };
var dec3 = engDecodeWAtLevel(ms, 3);
var ar1h = engCalcAR(dec3, stats, 0, false);
var ar2h = engCalcAR(dec3, stats, 0, true);

// Deep dump: raw float values and engine internals
console.log("=== RAW ENGINE INTERNALS (Morning Star +3) ===");
console.log("Encoded ak (attack keys):", JSON.stringify(ms.ak));
console.log("Encoded as (scaling keys):", JSON.stringify(ms.as));
console.log("dec3.attack[0]:", JSON.stringify(dec3.attack[0]));
console.log("dec3.attributeScaling[0]:", JSON.stringify(dec3.attributeScaling[0]));
console.log();
console.log("RAW ar1h.attackPower[0] (physical):", ar1h.attackPower[0]);
console.log("RAW ar2h.attackPower[0] (physical):", ar2h.attackPower[0]);
console.log("RAW ar1h.attackPower[7] (bleed):", ar1h.attackPower[7]);
console.log();

// Manual breakdown of 1H calc
var base = dec3.attack[0][0]; // physical base after upgrade
console.log("Base physical (dec3.attack[0][0]):", base);
var strVal = 12; // 1H
var strScale = dec3.attributeScaling[0]['str'] || 0;
var strCurveVal = dec3.calcCorrectGraphs[0][strVal];
console.log("STR scaling coefficient at +3:", strScale);
console.log("calcCorrectGraph[0][12] (STR curve at 12):", strCurveVal);
var strBonus = base * strCurveVal * strScale;
console.log("STR scaling contribution (1H, 12 STR):", strBonus);
var dexVal = 10;
var dexScale = dec3.attributeScaling[0]['dex'] || 0;
var dexCurveVal = dec3.calcCorrectGraphs[0][dexVal];
console.log("DEX scaling coefficient at +3:", dexScale);
console.log("calcCorrectGraph[0][10] (DEX curve at 10):", dexCurveVal);
var dexBonus = base * dexCurveVal * dexScale;
console.log("DEX scaling contribution (1H, 10 DEX):", dexBonus);
console.log("Total 1H = base + strBonus + dexBonus =", base, "+", strBonus, "+", dexBonus, "=", base + strBonus + dexBonus);
console.log();
// 2H: str becomes 18
var strVal2h = 18;
var strCurveVal2h = dec3.calcCorrectGraphs[0][strVal2h];
console.log("calcCorrectGraph[0][18] (STR curve at 18, 2H):", strCurveVal2h);
var strBonus2h = base * strCurveVal2h * strScale;
console.log("STR scaling contribution (2H, 18 effective STR):", strBonus2h);
console.log("Total 2H = base + strBonus2h + dexBonus =", base, "+", strBonus2h, "+", dexBonus, "=", base + strBonus2h + dexBonus);
console.log();

console.log("=== MORNING STAR +3 @ 12 STR / 10 DEX (Wretch level 3 minimum-wield) ===");
console.log("1H Physical AR:", Math.floor(ar1h.attackPower[0] || 0));
console.log("1H Bleed buildup:", Math.floor(ar1h.attackPower[7] || 0));
console.log("2H Physical AR:", Math.floor(ar2h.attackPower[0] || 0));
console.log("2H Bleed buildup:", Math.floor(ar2h.attackPower[7] || 0));
console.log();

// Also compare to Wretch level 1 (10 STR, unmet req, 60% scaling penalty)
var stats1 = { str:10, dex:10, int:10, fai:10, arc:10 };
var ar1h_unmet = engCalcAR(dec3, stats1, 0, false);
var ar2h_unmet = engCalcAR(dec3, stats1, 0, true);
console.log("=== MORNING STAR +3 @ 10 STR / 10 DEX (UNMET req, 60% scaling penalty) ===");
console.log("1H Physical AR:", Math.floor(ar1h_unmet.attackPower[0] || 0));
console.log("2H Physical AR:", Math.floor(ar2h_unmet.attackPower[0] || 0));
console.log("(2H effective STR = 15 due to +50% bonus, which meets the 12 STR req — so 2H bypasses the penalty at 10 STR base)");
console.log();

// Verify: Fextralife base physical at +3 = 138. Engine total at 12 STR = ?
console.log("=== Fextralife cross-check ===");
console.log("Fextralife base physical at +3:", 138);
console.log("Engine total at +3, 12 STR, 1H (includes scaling):", Math.floor(ar1h.attackPower[0] || 0));
console.log("Scaling contribution at 12 STR / D-rank:", Math.floor(ar1h.attackPower[0] || 0) - 138);
console.log();

// Post-Greyoll level: starting from level 3 (not level 1) since player invested 2 STR at step 39
console.log("=== POST-GREYOLL LEVEL (starting Wretch level 3 after 2 STR investment) ===");
var startLvl = 3;
var runesPerKill = 80000;
var lvl1 = startLvl + levelsFromRunes(startLvl, runesPerKill);
var lvl2 = lvl1 + levelsFromRunes(lvl1, runesPerKill);
var lvl3 = lvl2 + levelsFromRunes(lvl2, runesPerKill);
console.log("After Greyoll kill 1:", lvl1, "(+" + (lvl1 - startLvl) + " levels)");
console.log("After Greyoll kill 2:", lvl2, "(+" + (lvl2 - startLvl) + " total, +" + (lvl2 - lvl1) + " from kill 2)");
console.log("After Greyoll kill 3:", lvl3, "(+" + (lvl3 - startLvl) + " total, +" + (lvl3 - lvl2) + " from kill 3)");
