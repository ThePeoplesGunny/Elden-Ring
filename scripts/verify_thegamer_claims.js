// Verify TheGamer.com early-weapons article claims against engine data
// Engine is trusted ONLY for datamined stat requirements (per
// feedback_engine_data_is_suspect.md — WEAPON_STEPS etc. are NOT trusted).

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

// Claims from TheGamer article:
var claims = [
  { w:"Morning Star",              articleReqs:{str:"low", dex:"low"},               articleBase:118 },
  { w:"Crystal Sword",             articleReqs:{str:13, dex:10, int:15},             articleBase:null },
  { w:"Uchigatana",                articleReqs:{str:11, dex:15},                     articleBase:115 },
  { w:"Zweihander",                articleReqs:{str:19, dex:22},                     articleBase:141 },
  { w:"Reduvia",                   articleReqs:{}/*"low" unspecified*/,              articleBase:null },
  { w:"Demi-Human Queen's Staff",  articleReqs:{int:10},                             articleBase:null },
  { w:"Shield of the Guilty",      articleReqs:{str:8},                              articleBase:null },
  { w:"Axe of Godrick",            articleReqs:{str:34, dex:22},                     articleBase:null },
  { w:"Mohgwyn's Sacred Spear",    articleReqs:{},                                    articleBase:null },
  { w:"Moonveil",                  articleReqs:{str:12, dex:18, int:23},             articleBase:null },
];

claims.forEach(function(c){
  var entries = ENG_DATA.reg.w.filter(function(w){ return w.w === c.w; });
  if (entries.length === 0) {
    console.log(c.w + " — NOT IN ENGINE DATA (cannot verify stat reqs from engine)");
    return;
  }
  var first = entries[0];
  var engReqs = first.r;
  console.log(c.w + "  [aff=" + first.a + "]");
  console.log("  engine req: " + JSON.stringify(engReqs));
  console.log("  article claim: " + JSON.stringify(c.articleReqs));
  // Check numeric matches
  Object.keys(c.articleReqs).forEach(function(stat){
    var claimed = c.articleReqs[stat];
    var engineVal = engReqs[stat];
    if (typeof claimed === 'number') {
      if (claimed === engineVal) console.log("    " + stat.toUpperCase() + " " + claimed + " — MATCH");
      else console.log("    " + stat.toUpperCase() + " " + claimed + " vs engine " + engineVal + " — MISMATCH");
    }
  });
  // Check +0 base physical AR if claimed
  if (c.articleBase !== null) {
    try {
      var dec0 = engDecodeWAtLevel(first, 0);
      var baseAR = Math.floor(dec0.attack[0][0]);
      console.log("    +0 base physical (engine): " + baseAR + " vs article " + c.articleBase + " → " + (baseAR === c.articleBase ? "MATCH" : "MISMATCH"));
    } catch(e) {
      console.log("    +0 base physical: (decode failed) " + e.message);
    }
  }
  console.log();
});
