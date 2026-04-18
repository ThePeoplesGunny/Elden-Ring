// Calibration script: compare engine predictions against Gunny's in-game
// level-up screen reads (captured during Phase 0 step 43 prep, 2026-04-17).
//
// Purpose: validate engHP, engFP, engStam, engEquip, and engCalcAR against
// actual Elden Ring display values. Any mismatch is an engine bug candidate.

const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
global.React = { useState: function(init){ var v=typeof init==='function'?init():init; return [v,function(){}]; }, useEffect: function(){}, createElement: function(){return null;} };
global.ReactDOM = { render: function(){} };
global.localStorage = { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} };
global.document = { getElementById: function(){return {};}, createElement: function(){return {href:'',download:'',click:function(){},style:{}};}, body:{appendChild:function(){},removeChild:function(){}} };
global.URL = { createObjectURL: function(){return '';}, revokeObjectURL: function(){} };
global.Blob = function(){};
global.FileReader = function(){ this.readAsText=function(){}; };
global.confirm = function(){return false;};
global.setTimeout = function(fn){fn();};
global.performance = { now: function(){return Date.now();} };
eval(scriptMatch[1]);

// Gunny's live in-game reads (Wretch, Morning Star +3, level-up preview screen):
var INGAME = {
  A: { stat:"VIG 15",         ingame:522,       engine:null, field:"HP" },
  B: { stat:"VIG 25 (soft)",  ingame:800,       engine:null, field:"HP" },
  C: { stat:"VIG 40 (hard)",  ingame:1450,      engine:null, field:"HP" },
  D: { stat:"MND 25",         ingame:147,       engine:null, field:"FP" },
  E_stam:  { stat:"END 25",   ingame:121,       engine:null, field:"Stamina" },
  E_equip: { stat:"END 25",   ingame:72,        engine:null, field:"Equip Load" },
  F_1h: { stat:"STR 20 / DEX 10", ingame:164,   engine:null, field:"MS+3 1H AR" },
  F_2h: { stat:"STR 20 / DEX 10", ingame:173,   engine:null, field:"MS+3 2H AR" },
  G_1h: { stat:"STR 30 / DEX 10", ingame:173,   engine:null, field:"MS+3 1H AR" },
  G_2h: { stat:"STR 30 / DEX 10", ingame:186,   engine:null, field:"MS+3 2H AR" },
  H_1h: { stat:"STR 40 / DEX 10", ingame:182,   engine:null, field:"MS+3 1H AR" },
  H_2h: { stat:"STR 40 / DEX 10", ingame:196,   engine:null, field:"MS+3 2H AR" },
};

// Derived-stat tests (HP/FP/Stam/Equip):
INGAME.A.engine = engHP(15);
INGAME.B.engine = engHP(25);
INGAME.C.engine = engHP(40);
INGAME.D.engine = engFP(25);
INGAME.E_stam.engine = engStam(25);
INGAME.E_equip.engine = engEquip(25);

// AR tests (Morning Star +3):
var ms = ENG_DATA.reg.w.find(function(w){ return w.w === "Morning Star" && w.a === 0; });
var dec3 = engDecodeWAtLevel(ms, 3);

function msAR(str, dex, twoH) {
  var stats = { str:str, dex:dex, int:10, fai:10, arc:10 };
  return engCalcAR(dec3, stats, 0, twoH).attackPower[0];
}

INGAME.F_1h.engine = msAR(20, 10, false);
INGAME.F_2h.engine = msAR(20, 10, true);
INGAME.G_1h.engine = msAR(30, 10, false);
INGAME.G_2h.engine = msAR(30, 10, true);
INGAME.H_1h.engine = msAR(40, 10, false);
INGAME.H_2h.engine = msAR(40, 10, true);

// Print comparison table
console.log("=== ENGINE vs IN-GAME CALIBRATION (2026-04-17) ===");
console.log("Wretch base, Morning Star +3 equipped\n");
console.log("Test | Stats                | Field         | In-game | Engine | Δ");
console.log("-----|----------------------|---------------|---------|--------|------");

Object.keys(INGAME).forEach(function(k){
  var row = INGAME[k];
  var delta = row.engine - row.ingame;
  var sign = delta > 0 ? "+" : "";
  console.log(
    k.padEnd(4) + " | " +
    row.stat.padEnd(20) + " | " +
    row.field.padEnd(13) + " | " +
    String(row.ingame).padStart(7) + " | " +
    String(row.engine).padStart(6) + " | " +
    sign + delta
  );
});

console.log("\n=== INTERPRETATION ===");
console.log("Δ = engine − in-game. Positive = engine overshoots.");
console.log("Zero Δ = engine matches the game's display exactly.");
console.log("Non-zero Δ on AR tests likely attributable to B13 (rounding mismatch).");
console.log("Non-zero Δ on derived stats (HP/FP/Stam/Equip) = NEW bug candidates.");
