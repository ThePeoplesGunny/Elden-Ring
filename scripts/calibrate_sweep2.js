// Phase 2 calibration: DEX + ARC scans on Morning Star +3.
// Engine predictions, Gunny reads in-game values.
//
// Morning Star +3 scaling (from encoded data): STR C, DEX D (est), ARC influences bleed buildup.

const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
global.React = { useState: function(init){var v=typeof init==='function'?init():init;return [v,function(){}];}, useEffect: function(){}, createElement: function(){return null;} };
global.ReactDOM = { render: function(){} };
global.localStorage = { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} };
global.document = { getElementById: function(){return {};}, createElement: function(){return {href:'',download:'',click:function(){},style:{}};}, body:{appendChild:function(){},removeChild:function(){}} };
global.URL = { createObjectURL: function(){return '';}, revokeObjectURL: function(){} };
global.Blob = function(){};
global.FileReader = function(){this.readAsText=function(){};};
global.confirm = function(){return false;};
global.setTimeout = function(fn){fn();};
global.performance = { now: function(){return Date.now();} };
eval(scriptMatch[1]);

var ms = ENG_DATA.reg.w.find(function(w){ return w.w === "Morning Star" && w.a === 0; });
var dec3 = engDecodeWAtLevel(ms, 3);

function msScan(label, stats) {
  var ar1h = engCalcAR(dec3, stats, 0, false);
  var ar2h = engCalcAR(dec3, stats, 0, true);
  console.log(
    label.padEnd(30) +
    " | 1H phys=" + String(Math.floor(ar1h.attackPower[0])).padStart(4) +
    " | 2H phys=" + String(Math.floor(ar2h.attackPower[0])).padStart(4) +
    " | 1H bleed=" + String(Math.floor(ar1h.attackPower[7])).padStart(3) +
    " | 2H bleed=" + String(Math.floor(ar2h.attackPower[7])).padStart(3)
  );
}

console.log("=== PHASE 2 CALIBRATION TARGETS (Morning Star +3) ===");
console.log("All engine outputs below are Math.floor() of the internal float");
console.log("Compare to what the level-up preview shows in-game.\n");
console.log("Config                         | 1H phys | 2H phys | 1H bleed | 2H bleed");
console.log("-------------------------------|---------|---------|----------|--------");

// DEX scan (STR stays at 12, Gunny's requirement-met minimum)
console.log("--- DEX scan (STR 12, INT/FAI/ARC at 10) ---");
msScan("DEX 10 (baseline)", { str:12, dex:10, int:10, fai:10, arc:10 });
msScan("DEX 20",            { str:12, dex:20, int:10, fai:10, arc:10 });
msScan("DEX 30",            { str:12, dex:30, int:10, fai:10, arc:10 });
msScan("DEX 40",            { str:12, dex:40, int:10, fai:10, arc:10 });
msScan("DEX 55 (soft cap)", { str:12, dex:55, int:10, fai:10, arc:10 });

// ARC scan — physical AR minor, bleed buildup primary
console.log("\n--- ARC scan (STR 12, DEX 10, INT/FAI at 10) ---");
msScan("ARC 10 (baseline)", { str:12, dex:10, int:10, fai:10, arc:10 });
msScan("ARC 25",            { str:12, dex:10, int:10, fai:10, arc:25 });
msScan("ARC 40",            { str:12, dex:10, int:10, fai:10, arc:40 });
msScan("ARC 60 (soft cap)", { str:12, dex:10, int:10, fai:10, arc:60 });
msScan("ARC 80 (hard cap)", { str:12, dex:10, int:10, fai:10, arc:80 });

// INT and FAI sanity — MS should have no scaling, values should not change
console.log("\n--- INT/FAI null scan (should all match baseline) ---");
msScan("INT 60 (MS has no INT)", { str:12, dex:10, int:60, fai:10, arc:10 });
msScan("FAI 60 (MS has no FAI)", { str:12, dex:10, int:10, fai:60, arc:10 });

console.log("\nEach row: set stat to the listed value in the level-up preview");
console.log("(don't confirm), read the 4 numbers from MS +3 in the weapon panel,");
console.log("report back. I'll diff against these engine predictions.");
