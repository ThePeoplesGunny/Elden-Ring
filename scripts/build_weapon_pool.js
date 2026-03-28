const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.1.html', 'utf8');
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

var weaponPool = {};

function addToPool(name, affinity, source, dmg, context) {
  if (!weaponPool[name]) weaponPool[name] = { name: name, affinities: new Set(), sources: new Set(), peakDmg: 0, contexts: [] };
  var w = weaponPool[name];
  w.affinities.add(affinity);
  w.sources.add(source);
  if (dmg > w.peakDmg) w.peakDmg = dmg;
  if (w.contexts.length < 5 && context) w.contexts.push(context);
}

// Phase 1: Global optimizer — 13 templates x 10 levels x 2 risk modes
console.error('Phase 1: Global optimizer...');
var levels = [10, 20, 30, 40, 50, 60, 80, 100, 120, 150];
levels.forEach(function(lvl) {
  ['total', 'maximin'].forEach(function(mode) {
    var results = globalOptimize(lvl, true, {riskMode: mode});
    results.forEach(function(r) {
      addToPool(r.singleWeapon.name, r.singleWeapon.affinity, 'opt-'+mode, r.singleWeapon.totalHTK ? 10000/r.singleWeapon.totalHTK : 0, 'Lv'+lvl+'/'+r.templateName);
      r.portfolio.weapons.forEach(function(pw) {
        if (pw.weapon !== 'None') addToPool(pw.weapon, pw.affinity, 'opt-portfolio', pw.dmg, pw.boss);
      });
    });
  });
});

// Phase 2: Per-boss — 17 bosses x 15 stat profiles x 2 grips x 3 progression stages
console.error('Phase 2: Per-boss analysis...');
var bossNames = Object.keys(BOSS_ENG_MAP);
var statProfiles = [
  {str:80,dex:10,int:10,fai:10,arc:10},
  {str:40,dex:10,int:10,fai:10,arc:10},
  {str:10,dex:80,int:10,fai:10,arc:10},
  {str:10,dex:40,int:10,fai:10,arc:10},
  {str:10,dex:10,int:80,fai:10,arc:10},
  {str:10,dex:12,int:40,fai:10,arc:10},
  {str:10,dex:10,int:10,fai:80,arc:10},
  {str:12,dex:10,int:10,fai:40,arc:10},
  {str:10,dex:10,int:10,fai:10,arc:80},
  {str:55,dex:55,int:10,fai:10,arc:10},
  {str:55,dex:10,int:10,fai:50,arc:10},
  {str:10,dex:55,int:50,fai:10,arc:10},
  {str:10,dex:55,int:10,fai:10,arc:45},
  {str:10,dex:10,int:10,fai:50,arc:45},
  {str:55,dex:10,int:50,fai:10,arc:10},
];

var fullGate = {affinities:[0,1,2,3,4,5,6,7,8,9,10,11,12], buyableRegMax:25, buyableSomMax:10};
var earlyGate = {affinities:[0,1,2,3], buyableRegMax:6, buyableSomMax:2};
var midGate = {affinities:[0,1,2,3,4,5,6,8], buyableRegMax:15, buyableSomMax:6};

bossNames.forEach(function(bn) {
  statProfiles.forEach(function(sp) {
    [false, true].forEach(function(twoHand) {
      [[fullGate,"Crumbling Farum Azula"],[earlyGate,"Limgrave"],[midGate,"Altus Plateau"]].forEach(function(pair) {
        var results = bestWeaponForBoss(bn, sp, pair[0], pair[1], twoHand);
        results.slice(0, 5).forEach(function(r) {
          addToPool(r.name, r.affinityName, 'boss-'+pair[1].substring(0,4).toLowerCase(), r.dmgPerHit, bn);
        });
      });
    });
  });
});

// Phase 3: Early game — Margit/Godrick with minimal stats
console.error('Phase 3: Early game...');
var earlyStats = [
  {str:14,dex:10,int:10,fai:10,arc:10},
  {str:10,dex:14,int:10,fai:10,arc:10},
  {str:12,dex:12,int:10,fai:10,arc:10},
  {str:10,dex:10,int:14,fai:10,arc:10},
  {str:10,dex:10,int:10,fai:14,arc:10},
];
["Margit, the Fell Omen","Godrick, the Grafted"].forEach(function(bn) {
  earlyStats.forEach(function(sp) {
    [false, true].forEach(function(twoHand) {
      var results = bestWeaponForBoss(bn, sp, earlyGate, "Limgrave", twoHand);
      results.slice(0,5).forEach(function(r) {
        addToPool(r.name, r.affinityName, 'early', r.dmgPerHit, bn+'/early');
      });
    });
  });
});

// Build output
var typeNames = ENG_DATA.weaponTypes || {};
var weaponTypeMap = {};
ENG_DATA.reg.w.forEach(function(w) { if (!weaponTypeMap[w.w]) weaponTypeMap[w.w] = w.t; });
var rangedTypes = [50,51,53,55,56];

var sorted = Object.values(weaponPool).map(function(w) {
  var tid = weaponTypeMap[w.name];
  return {
    name: w.name,
    type: typeNames[tid] || 'Type'+tid,
    typeId: tid,
    affinities: Array.from(w.affinities).sort(),
    sources: Array.from(w.sources).sort(),
    sourceCount: w.sources.size,
    peakDmg: Math.round(w.peakDmg)
  };
}).sort(function(a,b) {
  if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
  return b.peakDmg - a.peakDmg;
});

var melee = sorted.filter(function(w) { return rangedTypes.indexOf(w.typeId) < 0 && w.typeId !== 57 && w.typeId !== 61; });
var ranged = sorted.filter(function(w) { return rangedTypes.indexOf(w.typeId) >= 0; });
var catalysts = sorted.filter(function(w) { return w.typeId === 57 || w.typeId === 61; });

console.log('ENGINE-VERIFIED MELEE POOL: ' + melee.length + ' weapons');
console.log('='.repeat(90));
melee.forEach(function(w, i) {
  console.log((i+1) + '. ' + w.name + ' [' + w.type + '] | ' + w.affinities.join(', ') + ' | sources(' + w.sourceCount + '): ' + w.sources.join(', ') + ' | peak: ' + w.peakDmg);
});

if (ranged.length > 0) {
  console.log('\nENGINE-VERIFIED RANGED POOL: ' + ranged.length);
  ranged.forEach(function(w, i) { console.log((i+1) + '. ' + w.name + ' [' + w.type + '] | peak: ' + w.peakDmg); });
}
if (catalysts.length > 0) {
  console.log('\nCATALYSTS: ' + catalysts.length);
  catalysts.forEach(function(w, i) { console.log((i+1) + '. ' + w.name + ' [' + w.type + '] | peak: ' + w.peakDmg); });
}

// Write JSON
var poolJSON = {
  generated: new Date().toISOString(),
  method: 'globalOptimize(10lvl x 2risk) + bestWeaponForBoss(17boss x 15stat x 2grip x 3gate) + earlyGame(2boss x 5stat x 2grip)',
  totalSearchSpace: ENG_DATA.reg.w.length,
  melee: melee,
  ranged: ranged,
  catalysts: catalysts
};
fs.writeFileSync('engine_weapon_pool.json', JSON.stringify(poolJSON, null, 2));
console.log('\nJSON saved to engine_weapon_pool.json');
console.log('Reduction: ' + ENG_DATA.reg.w.length + ' -> ' + (melee.length + ranged.length + catalysts.length) + ' (' + Math.round((melee.length + ranged.length + catalysts.length)/ENG_DATA.reg.w.length*100) + '% of original)');
