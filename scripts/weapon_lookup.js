const fs = require('fs');
const html = fs.readFileSync('Tarnished_Companion_v3.9.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
global.React = { useState: function(i){var v=typeof i==='function'?i():i;return [v,function(){}];}, useEffect:function(){}, createElement:function(){return null;}};
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

var sample = ENG_DATA.reg.w[0];
console.log("Sample weapon keys: " + Object.keys(sample).join(","));
console.log();

var names = ["Lordsworn's Greatsword","Reduvia","Morning Star","Bloodhound's Fang","Winged Scythe","Coded Sword","Halo Scythe","Claymore","Uchigatana","Flail"];
names.forEach(function(n){
  var all = ENG_DATA.reg.w.filter(function(w){ return w.w === n; });
  all.forEach(function(w, idx){
    console.log(n + " [aff=" + w.a + "]  req=" + JSON.stringify(w.rq || w.r || w.req || "?") + "  type=" + w.t);
  });
});
