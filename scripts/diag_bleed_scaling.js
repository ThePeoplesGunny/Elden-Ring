// Diagnose: does the engine scale bleed buildup with upgrade level for ANY weapon?
// If Reduvia/Uchigatana also flat-line at 50, the engine has a systemic bug.
// If they scale and Morning Star doesn't, Morning Star's encoded data is missing status offsets.

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

// Test weapons known to scale bleed in real Elden Ring
var testCases = [
  { name: "Morning Star",        affinity: 0, stats: { str:12, dex:10, int:10, fai:10, arc:10 } },
  { name: "Reduvia",             affinity:-1, stats: { str:10, dex:13, int:10, fai:10, arc:13 } },
  { name: "Uchigatana",          affinity: 0, stats: { str:11, dex:15, int:10, fai:10, arc:10 } },
  { name: "Flail",               affinity: 0, stats: { str:10, dex:18, int:10, fai:10, arc:10 } },
  { name: "Bandit's Curved Sword", affinity: 0, stats: { str:10, dex:13, int:10, fai:10, arc:10 } },
  { name: "Great Knife",         affinity: 0, stats: { str:10, dex:11, int:10, fai:10, arc:10 } },
  { name: "Bloodhound's Fang",   affinity:-1, stats: { str:18, dex:17, int:10, fai:10, arc:10 } }
];

testCases.forEach(function(tc) {
  var w = ENG_DATA.reg.w.find(function(x){ return x.w === tc.name && x.a === tc.affinity; });
  if (!w) { console.log("NOT FOUND: " + tc.name + " (a=" + tc.affinity + ")"); return; }
  console.log("=== " + tc.name + " (a=" + tc.affinity + ", t=" + w.t + ") ===");
  console.log("  Encoded sp:", JSON.stringify(w.sp), " ri:", w.ri);
  var rp = ENG_DATA.reg.rt[w.ri];
  console.log("  rt length:", rp.length, " — checking statusSpEffectId offsets across levels:");
  var sample = [0, 5, 10, 15, 20, 25].filter(function(i){ return i < rp.length; });
  sample.forEach(function(i){
    var r = rp[i];
    console.log("    +" + i + ": ssId1=" + (r.statusSpEffectId1 || 0) + " ssId2=" + (r.statusSpEffectId2 || 0) + " ssId3=" + (r.statusSpEffectId3 || 0));
  });
  console.log("  Bleed buildup (1H, 2H) at upgrade levels:");
  [0, 5, 10, 15, 20, 25].filter(function(u){ return u < rp.length; }).forEach(function(u){
    var dec = engDecodeWAtLevel(w, u);
    var ar1 = engCalcAR(dec, tc.stats, 0, false);
    var ar2 = engCalcAR(dec, tc.stats, 0, true);
    console.log("    +" + u + ": 1H bleed=" + Math.floor(ar1.attackPower[7]||0) + ", 2H bleed=" + Math.floor(ar2.attackPower[7]||0) + ", 1H phys=" + Math.floor(ar1.attackPower[0]||0));
  });
  console.log();
});

// Look at the sse lookup table and see what spId 6401 returns
console.log("=== sse[6401] (the sp ID for Morning Star/Flail standard bleed) ===");
console.log(JSON.stringify(ENG_DATA.reg.sse[6401]));
console.log();

// Check what nearby sse entries look like — would scaling produce these?
console.log("=== nearby sse entries (if scaling exists, expected at offsets near 6401) ===");
[6400, 6401, 6402, 6403, 6405, 6410, 6450, 6500].forEach(function(id){
  console.log("  sse[" + id + "]:", JSON.stringify(ENG_DATA.reg.sse[id]));
});
