// Archetype × Weapon forecast — REWRITE:
// optimizeStats finds the weapon-optimal allocation regardless of archetype
// template. So we get one optimal allocation per weapon, and label it with
// the archetype it corresponds to. Gunny picks the row that matches his
// commitment intent AND whose acquisition hazard he'll accept.

const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
global.React = { useState:function(i){var v=typeof i==='function'?i():i;return [v,function(){}];}, useEffect:function(){}, createElement:function(){return null;}};
global.ReactDOM = { render:function(){} };
global.localStorage = { getItem:function(){return null;}, setItem:function(){}, removeItem:function(){} };
global.document = { getElementById:function(){return {};}, createElement:function(){return {href:'',download:'',click:function(){},style:{}};}, body:{appendChild:function(){},removeChild:function(){}} };
global.URL = { createObjectURL:function(){return '';}, revokeObjectURL:function(){} };
global.Blob = function(){};
global.FileReader = function(){this.readAsText=function(){};};
global.confirm = function(){return false;};
global.setTimeout = function(fn){fn();};
global.performance = { now:function(){return Date.now();} };
eval(scriptMatch[1]);

// Find Margit
var margitIdx = null;
ENG_DATA.bosses.forEach(function(b, i){
  if (b.ph && b.ph[0] && b.ph[0].n && b.ph[0].n.indexOf("Margit") >= 0 && margitIdx === null) margitIdx = i;
});
var margit = ENG_DATA.bosses[margitIdx];
console.log("Target: " + margit.ph[0].n + "  HP=" + margit.hp);
console.log();

// Candidate weapons (aff selected per data confirmed in weapon_lookup.js)
var CANDIDATES = [
  { name:"Morning Star",            aff:0,  where:"Already equipped",                        haz:"0 — owned" },
  { name:"Lordsworn's Greatsword",  aff:1,  where:"Gatefront chest (Heavy infused in data)",  haz:"0 — owned" },
  { name:"Flail",                   aff:0,  where:"Gatefront Ruins",                          haz:"0 — trivial" },
  { name:"Claymore",                aff:0,  where:"Castle Morne road, Weeping Peninsula",     haz:"LOW — road skeletons" },
  { name:"Uchigatana",              aff:0,  where:"Deathtouched Catacombs, North Limgrave",   haz:"LOW — short catacombs" },
  { name:"Bloodhound's Fang",       aff:-1, where:"Forlorn Hound Evergaol (Darriwil boss)",   haz:"MED — real 1v1 fight" },
  { name:"Winged Scythe",           aff:-1, where:"Tombsward Ruins (Weeping Peninsula)",      haz:"LOW-MED — imps around chest" },
  { name:"Reduvia",                 aff:-1, where:"Murkwater riverside (Nerijus invasion)",   haz:"MED — NPC red invasion" },
  { name:"Coded Sword",             aff:-1, where:"Roundtable Hold (chest behind Ensha)",     haz:"0 — free in Roundtable" },
  { name:"Halo Scythe",             aff:-1, where:"Roundtable Hold (Ensha quest reward)",     haz:"MED — kill Ensha at Roundtable eventually" },
];

function formatAlloc(stats) {
  var parts = [];
  ["vig","mnd","end","str","dex","int","fai","arc"].forEach(function(s){
    if (stats[s] > 10) parts.push(s.toUpperCase() + " " + stats[s]);
    else if (s === "str" && stats[s] !== 10) parts.push(s.toUpperCase() + " " + stats[s]);
  });
  return parts.join(", ");
}

function classifyArchetype(stats) {
  var offStats = {str:stats.str, dex:stats.dex, int:stats.int, fai:stats.fai, arc:stats.arc};
  var above10 = Object.keys(offStats).filter(function(s){ return offStats[s] > 10; });
  if (above10.length === 1) return "Pure " + above10[0].toUpperCase();
  if (above10.length === 2) return above10.map(function(s){return s.toUpperCase();}).join("/");
  if (above10.length >= 3) return above10.map(function(s){return s.toUpperCase();}).join("/");
  return "None";
}

function runForecast(cand) {
  var wEnc = ENG_DATA.reg.w.find(function(w){ return w.w === cand.name && w.a === cand.aff; });
  if (!wEnc) return { error: "weapon not found: " + cand.name + " aff=" + cand.aff };
  var params = {
    bossIdx: margitIdx,
    targetLevel: 51,
    cls: WRETCH,
    wEnc: wEnc,
    twoHand: true,
    isCaster: false,
    region: "Limgrave",
    gateState: { buyableRegMax: 3, buyableSomMax: 1 },  // Stone[1] + Somber[1] accessible
    preset: "balanced"
  };
  try {
    var r = optimizeStats(params);
    return r;
  } catch(e) {
    return { error: e.message };
  }
}

console.log("=== ARCHETYPE × WEAPON FORECAST ===");
console.log("Wretch → L51 (150K runes from Greyoll farm), 2H grip, vs Margit");
console.log("Upgrade cap: Standard +3 / Somber +1 (realistic pre-Margit)");
console.log("");
console.log("** Engine hits-to-kill = R1-only worst-case floor (B20: no motion value) **");
console.log("** Realistic mixed-attack play runs ~0.65x the floor (empirical, 2026-04-19) **");
console.log();
console.log("Weapon                       | Archetype fit  | R1 floor         | Realistic | Allocation                                | Acquisition");
console.log("-----------------------------|----------------|------------------|-----------|-------------------------------------------|-------------");

CANDIDATES.forEach(function(cand){
  var r = runForecast(cand);
  if (r.error) {
    console.log(cand.name.padEnd(28) + " | ERROR: " + r.error);
    return;
  }
  var arch = classifyArchetype(r.stats);
  var floor = r.hitsToKill || 0;
  var real = Math.max(1, Math.round(floor * 0.65));
  var bossLine = "AR " + (r.dmgPerHit || 0) + " / " + floor + " hits";
  var realLine = "~" + real + " hits";
  console.log(
    cand.name.padEnd(28) + " | " +
    arch.padEnd(14) + " | " +
    bossLine.padEnd(16) + " | " +
    realLine.padEnd(9) + " | " +
    formatAlloc(r.stats).padEnd(41) + " | " +
    cand.haz
  );
});

console.log();
console.log("HP/Stam/Equip (from best allocation baseline):");
CANDIDATES.forEach(function(cand){
  var r = runForecast(cand);
  if (r.error) return;
  console.log("  " + cand.name.padEnd(26) + " HP=" + r.hp + " FP=" + r.fp + " Stam=" + r.stamina);
});

console.log();
console.log("=== INTERPRETATION ===");
console.log("• 'Allocation' column: stats to push above base 10 (or above Wretch STR 10).");
console.log("  The remainder of your 48 levels went into VIG for survivability.");
console.log("• 'Archetype fit' is just a label for the resulting stat shape.");
console.log("• 'R1 floor' is engine's hits-to-kill assuming every attack is R1 (MV=1.0).");
console.log("• 'Realistic' is R1 floor × 0.65 — calibrated against Gunny's 2026-04-19 empirical kill (3 hits 1H, 2 hits 2H on Soldier of Godrick vs engine floor 5/4).");
console.log("• B20 is open: engine lacks motion value modeling. Relative rankings are correct; absolute floors under-sell real play.");
console.log("• Acquisition hazard is Gunny judgment — the numbers assume you HAVE the weapon.");
