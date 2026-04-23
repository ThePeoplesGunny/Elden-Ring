#!/usr/bin/env node
// Phase B-Merchant extension: specialist vendors (Fextralife, 2026-04-22)
// Appends 6 merchants (Rogier, Gowry, Seluvis, D, Gurranq, Imprisoned Mohgwyn)
// to data/merchants.json. Handles two non-rune currencies: Starlight Shards
// (Seluvis spirit-ash puppets) and Deathroot (Gurranq trades).
//
// Script is idempotent: skips merchants already present by name.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MERCHANTS_PATH = path.join(ROOT, 'data', 'merchants.json');

const NEW_MERCHANTS = [
  {
    name: 'Sorcerer Rogier',
    location: 'Stormveil Castle (initial), Roundtable Hold (post-Godrick)',
    region: 'Roundtable Hold',
    type: 'ash_of_war_vendor',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Sorcerer+Rogier',
    complete: true,
    completeness_note: 'Questline-limited: shop inaccessible once Rogier dies after Ranni questline progression.',
    inventory: [
      { name: 'Ash of War: Glintstone Pebble', runes: 1500, category: 'ash_of_war', prereq: null },
      { name: 'Ash of War: Carian Greatsword', runes: 2500, category: 'ash_of_war', prereq: null },
      { name: 'Ash of War: Spinning Weapon', runes: 1000, category: 'ash_of_war', prereq: null },
    ],
  },
  {
    name: 'Gowry',
    location: "Gowry's Shack, Caelid",
    region: 'Caelid',
    type: 'spell_vendor',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Gowry',
    complete: true,
    completeness_note: 'Shop unlocks progressively through Millicent questline.',
    inventory: [
      { name: 'Glintstone Stars', runes: 3000, category: 'sorcery', prereq: "After Millicent leaves Gowry's Shack" },
      { name: 'Night Shard', runes: 4000, category: 'sorcery', prereq: "After Millicent leaves Gowry's Shack" },
      { name: "Night Maiden's Mist", runes: 5000, category: 'sorcery', prereq: "After Millicent leaves Gowry's Shack" },
      { name: 'Pest Threads', runes: 7500, category: 'sorcery', prereq: "After giving Millicent the Valkyrie's Prosthesis" },
    ],
  },
  {
    name: 'Preceptor Seluvis',
    location: "Seluvis's Rise, Three Sisters, Liurnia of the Lakes",
    region: 'Liurnia of the Lakes',
    type: 'spell_vendor',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Preceptor+Seluvis',
    complete: true,
    completeness_note: 'Has TWO shops: primary sorceries (runes) + secondary spirit-ash puppets (Starlight Shards currency, unlocked after quest progression).',
    inventory: [
      { name: 'Carian Phalanx', runes: 12000, category: 'sorcery', prereq: null },
      { name: 'Carian Retaliation', runes: 9000, category: 'sorcery', prereq: null },
      { name: 'Glintstone Icecrag', runes: 7500, category: 'sorcery', prereq: null },
      { name: 'Freezing Mist', runes: 6000, category: 'sorcery', prereq: null },
      { name: 'Glintblade Phalanx', runes: 2500, category: 'sorcery', prereq: 'Royal House Scroll' },
      { name: 'Carian Slicer', runes: 1500, category: 'sorcery', prereq: 'Royal House Scroll' },
      { name: 'Great Glintstone Shard', runes: 2000, category: 'sorcery', prereq: 'Academy Scroll' },
      { name: 'Swift Glintstone Shard', runes: 600, category: 'sorcery', prereq: 'Academy Scroll' },
      { name: 'Glintstone Cometshard', runes: 12000, category: 'sorcery', prereq: 'Conspectus Scroll' },
      { name: 'Star Shower', runes: 10000, category: 'sorcery', prereq: 'Conspectus Scroll' },
      { name: 'Finger Maiden Therolina Puppet', runes: null, specialCost: { amount: 2, currency: 'Starlight Shards' }, category: 'spirit', prereq: 'Puppet shop unlocked via quest' },
      { name: 'Jarwight Puppet', runes: null, specialCost: { amount: 3, currency: 'Starlight Shards' }, category: 'spirit', prereq: 'Puppet shop unlocked via quest' },
      { name: 'Dolores the Sleeping Arrow Puppet', runes: null, specialCost: { amount: 5, currency: 'Starlight Shards' }, category: 'spirit', prereq: 'Give potion to Nepheli' },
      { name: 'Dung Eater Puppet', runes: null, specialCost: { amount: 5, currency: 'Starlight Shards' }, category: 'spirit', prereq: 'Give potion to Dung Eater' },
    ],
  },
  {
    name: 'D, Hunter of the Dead',
    location: 'Roundtable Hold',
    region: 'Roundtable Hold',
    type: 'spell_vendor',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/D%2C+Hunter+of+the+Dead',
    complete: true,
    completeness_note: 'Shop unlocks after player visits Gurranq at the Bestial Sanctum.',
    inventory: [
      { name: 'Litany of Proper Death', runes: 2500, category: 'incantation', prereq: 'Visited Gurranq' },
      { name: "Order's Blade", runes: 3000, category: 'incantation', prereq: 'Visited Gurranq' },
    ],
  },
  {
    name: 'Gurranq, Beast Clergyman',
    location: 'Bestial Sanctum, Dragonbarrow',
    region: 'Dragonbarrow',
    type: 'special_trader',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Gurranq+Beast+Clergyman',
    complete: true,
    completeness_note: 'Trades Deathroot (key item currency) for rewards; cumulative counter (1st Deathroot delivered = Clawmark Seal + Beast Eye, 2nd = Bestial Sling, etc.). Also grants Beast Eye on first trade.',
    inventory: [
      { name: 'Clawmark Seal', runes: null, specialCost: { amount: 1, currency: 'Deathroot' }, category: 'weapon', prereq: null },
      { name: 'Bestial Sling', runes: null, specialCost: { amount: 2, currency: 'Deathroot' }, category: 'incantation', prereq: null },
      { name: 'Bestial Vitality', runes: null, specialCost: { amount: 3, currency: 'Deathroot' }, category: 'incantation', prereq: null },
      { name: "Ash of War: Beast's Roar", runes: null, specialCost: { amount: 4, currency: 'Deathroot' }, category: 'ash_of_war', prereq: null },
      { name: 'Beast Claw', runes: null, specialCost: { amount: 5, currency: 'Deathroot' }, category: 'incantation', prereq: null },
      { name: 'Stone of Gurranq', runes: null, specialCost: { amount: 6, currency: 'Deathroot' }, category: 'incantation', prereq: null },
      { name: 'Beastclaw Greathammer', runes: null, specialCost: { amount: 7, currency: 'Deathroot' }, category: 'weapon', prereq: null },
      { name: "Gurranq's Beast Claw", runes: null, specialCost: { amount: 8, currency: 'Deathroot' }, category: 'incantation', prereq: null },
      { name: 'Ancient Dragon Smithing Stone', runes: null, specialCost: { amount: 9, currency: 'Deathroot' }, category: 'upgrade_material', prereq: null },
    ],
  },
  {
    name: 'Imprisoned Merchant (Mohgwyn)',
    location: 'Mohgwyn Dynasty Mausoleum',
    region: 'Mohgwyn Palace',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Imprisoned+Merchant',
    complete: true,
    inventory: [
      { name: 'Rune Arc', runes: 8000, stock: 3, category: 'consumable' },
      { name: 'Stanching Boluses', runes: 1200, stock: 3, category: 'consumable' },
      { name: 'Festering Bloody Finger', runes: 2000, stock: 10, category: 'multiplayer' },
      { name: 'Bloodrose', runes: 800, stock: 'infinite', category: 'crafting_material' },
      { name: 'Stonesword Key', runes: 5000, stock: 5, category: 'key_item' },
      { name: 'Lost Ashes of War', runes: 5000, stock: 1, category: 'crafting_material' },
      { name: 'Dwelling Arrow', runes: 160, stock: 'infinite', category: 'ammo' },
      { name: 'Burred Bolt', runes: 200, stock: 'infinite', category: 'ammo' },
    ],
  },
];

const doc = JSON.parse(fs.readFileSync(MERCHANTS_PATH, 'utf8'));
const existingNames = new Set(doc.merchants.map(m => m.name));
let added = 0;
for (const m of NEW_MERCHANTS) {
  if (existingNames.has(m.name)) continue;
  doc.merchants.push(m);
  added++;
}
doc.fetchedAt = '2026-04-22';
doc.note = 'Expanded: 14 merchants. Stationary-merchant coverage complete (spell vendors, special traders, Imprisoned Mohgwyn). Nomadic/Isolated/Hermit merchants (region-scattered) still out of scope — covered by per-region harvest later.';
fs.writeFileSync(MERCHANTS_PATH, JSON.stringify(doc, null, 2));

console.log('=== Phase B-Merchant specialists extension ===');
console.log(`Added ${added} new merchants.`);
console.log(`Total merchants in file: ${doc.merchants.length}`);
const totalItems = doc.merchants.reduce((s, m) => s + m.inventory.length, 0);
console.log(`Total inventory items: ${totalItems}`);
