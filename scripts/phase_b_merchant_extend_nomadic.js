#!/usr/bin/env node
// Phase B-Merchant extension: nomadic + isolated vendors (Fextralife, 2026-04-22)
// Appends 17 merchants (14 Nomadic, 3 Isolated) to data/merchants.json.
// Completes region-scattered merchant coverage per Fextralife's Nomadic /
// Isolated taxonomy. Remaining merchant-category gaps after this pass:
//   - Pidia, Carian Servant (Caria Manor) — separate Fextralife category,
//     not Nomadic/Isolated. Defer.
//   - Patches at satellite locations (Volcano Manor, Scenic Isle) —
//     inventory identical to main Patches entry; intentional skip.
//   - Enia (Fingerfolk remembrance trades) — not rune-based, separate
//     mechanic. Out of scope for merchants schema.
//
// Script is idempotent: skips merchants already present by name.
//
// Category taxonomy (matches existing data/merchants.json convention):
//   weapon | armor | ammo | consumable | crafting_material | cookbook |
//   key_item | info_item | smithing_stone | multiplayer | sorcery |
//   incantation | spirit | ash_of_war | talisman
//
// "Note: X" items are tagged info_item across the board (bestiary /
// crafting hint pamphlets — not key progression items).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MERCHANTS_PATH = path.join(ROOT, 'data', 'merchants.json');

const NEW_MERCHANTS = [
  {
    name: 'Nomadic Merchant West Limgrave',
    location: 'Southeast of Coastal Cave entrance, under collapsed stone structure',
    region: 'Limgrave',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+West+Limgrave',
    complete: true,
    inventory: [
      { name: "Armorer's Cookbook [2]", runes: 600, stock: 1, category: 'cookbook' },
      { name: 'Neutralizing Boluses', runes: 600, stock: 5, category: 'consumable' },
      { name: 'Stanching Boluses', runes: 600, stock: 3, category: 'consumable' },
      { name: 'Stimulating Boluses', runes: 1500, stock: 2, category: 'consumable' },
      { name: 'Smithing Stone [1]', runes: 200, stock: 3, category: 'smithing_stone' },
      { name: 'Broadsword', runes: 1800, stock: 1, category: 'weapon' },
      { name: 'Iron Roundshield', runes: 900, stock: 1, category: 'weapon' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Shortbow', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Club', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Note: Land Squirts', runes: 200, stock: 1, category: 'info_item' },
      { name: 'Note: Stonedigger Trolls', runes: 400, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Nomadic Merchant East Limgrave',
    location: 'Mistwood campfire, between Mistwood Ruins and Fort Haight',
    region: 'Limgrave',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+East+Limgrave',
    complete: true,
    inventory: [
      { name: 'Festering Bloody Finger', runes: 1000, stock: 5, category: 'multiplayer' },
      { name: 'Sliver of Meat', runes: 500, stock: 5, category: 'crafting_material' },
      { name: 'Beast Liver', runes: 500, stock: 5, category: 'crafting_material' },
      { name: 'Lump of Flesh', runes: 800, stock: 3, category: 'crafting_material' },
      { name: "Trina's Lily", runes: 1000, stock: 3, category: 'crafting_material' },
      { name: 'Smithing Stone [1]', runes: 200, stock: 3, category: 'smithing_stone' },
      { name: "Nomadic Warrior's Cookbook [5]", runes: 1500, stock: 1, category: 'cookbook' },
      { name: "Armorer's Cookbook [3]", runes: 2000, stock: 1, category: 'cookbook' },
      { name: 'Hand Axe', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: "St. Trina's Arrow", runes: 160, stock: 10, category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Riveted Wooden Shield', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Blue-Gold Kite Shield', runes: 1000, stock: 1, category: 'weapon' },
    ],
  },
  {
    name: 'Nomadic Merchant North Limgrave',
    location: 'East of Saintsbridge, campfire by road in Stormhill',
    region: 'Limgrave',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+North+Limgrave',
    complete: true,
    inventory: [
      { name: 'Pickled Turtle Neck', runes: 800, stock: 3, category: 'consumable' },
      { name: 'Cracked Pot', runes: 600, stock: 1, category: 'key_item' },
      { name: 'Smithing Stone [1]', runes: 200, stock: 3, category: 'smithing_stone' },
      { name: "Nomadic Warrior's Cookbook [3]", runes: 500, stock: 1, category: 'cookbook' },
      { name: 'Short Sword', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Halberd', runes: 1200, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Bandit Mask', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Note: Flame Chariots', runes: 300, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Nomadic Merchant West Liurnia of the Lakes',
    location: 'Campfire directly north of Liurnia Lake Shore Site of Grace',
    region: 'Liurnia of the Lakes',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+West+Liurnia+of+the+Lakes',
    complete: true,
    inventory: [
      { name: 'Lantern', runes: 1800, stock: 1, category: 'key_item' },
      { name: 'Smithing Stone [1]', runes: 200, stock: 5, category: 'smithing_stone' },
      { name: 'Smithing Stone [2]', runes: 400, stock: 3, category: 'smithing_stone' },
      { name: "Nomadic Warrior's Cookbook [11]", runes: 1500, stock: 1, category: 'cookbook' },
      { name: 'Estoc', runes: 3000, stock: 1, category: 'weapon' },
      { name: "Astrologer's Staff", runes: 800, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Kite Shield', runes: 1000, stock: 1, category: 'weapon' },
      { name: 'Astrologer Hood', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Astrologer Robe', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Astrologer Gloves', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Astrologer Trousers', runes: 1000, stock: 1, category: 'armor' },
    ],
  },
  {
    name: 'Nomadic Merchant North Liurnia of the Lakes',
    location: 'Past Bellum Church hole, beneath rock arch',
    region: 'Liurnia of the Lakes',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+North+Liurnia+of+the+Lakes',
    complete: true,
    inventory: [
      { name: 'Rune Arc', runes: 4000, stock: 3, category: 'consumable' },
      { name: 'Immunizing Cured Meat', runes: 2000, stock: 3, category: 'consumable' },
      { name: 'Invigorating White Cured Meat', runes: 2000, stock: 3, category: 'consumable' },
      { name: 'Clarifying White Cured Meat', runes: 2000, stock: 3, category: 'consumable' },
      { name: 'Bewitching Branch', runes: 1600, stock: 5, category: 'consumable' },
      { name: "Nomadic Warrior's Cookbook [13]", runes: 2000, stock: 1, category: 'cookbook' },
      { name: 'Composite Bow', runes: 3500, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Rift Shield', runes: 1800, stock: 1, category: 'weapon' },
      { name: 'Blue Crest Heater Shield', runes: 1500, stock: 1, category: 'weapon' },
    ],
  },
  {
    name: 'Nomadic Merchant Castle Morne Rampart',
    location: 'Next to Castle Morne Rampart Site of Grace, Weeping Peninsula',
    region: 'Weeping Peninsula',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+Castle+Morne+Rampart',
    complete: true,
    inventory: [
      { name: 'Kukri', runes: 60, stock: 'infinite', category: 'consumable' },
      { name: 'Cracked Pot', runes: 600, stock: 1, category: 'key_item' },
      { name: 'Smithing Stone [1]', runes: 200, stock: 3, category: 'smithing_stone' },
      { name: 'Smithing Stone [2]', runes: 400, stock: 1, category: 'smithing_stone' },
      { name: 'Stonesword Key', runes: 2000, stock: 1, category: 'key_item' },
      { name: 'Bastard Sword', runes: 3000, stock: 1, category: 'weapon' },
      { name: 'Light Crossbow', runes: 1500, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Great Arrow', runes: 300, stock: 8, category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Ballista Bolt', runes: 300, stock: 8, category: 'ammo' },
      { name: 'Red Thorn Roundshield', runes: 600, stock: 1, category: 'weapon' },
      { name: 'Round Shield', runes: 1000, stock: 1, category: 'weapon' },
      { name: 'Iron Helmet', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Scale Armor', runes: 2400, stock: 1, category: 'armor' },
      { name: 'Iron Gauntlets', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Leather Trousers', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Crimson Amber Medallion', runes: 1500, stock: 1, category: 'talisman' },
      { name: 'Note: Demi-human Mobs', runes: 500, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Nomadic Merchant Caelid South',
    location: 'Southern Caelid Highway campfire junction',
    region: 'Caelid',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+Caelid+South',
    complete: true,
    completeness_note: 'Cracked Pot inventory slot may be unavailable if player selected Cracked Pot as starting keepsake.',
    inventory: [
      { name: 'Cracked Pot', runes: 1500, stock: 1, category: 'key_item' },
      { name: 'Stonesword Key', runes: 4000, stock: 1, category: 'key_item' },
      { name: "Nomadic Warrior's Cookbook [15]", runes: 4000, stock: 1, category: 'cookbook' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Flaming Bolt', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Champion Headband', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Greathelm', runes: 1800, stock: 1, category: 'armor' },
      { name: 'Champion Pauldron', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Champion Bracers', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Champion Gaiters', runes: 1000, stock: 1, category: 'armor' },
      { name: "Note: Gravity's Advantage", runes: 800, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Nomadic Merchant Caelid Highway North',
    location: 'East of Caelid Highway North Site of Grace, campfire',
    region: 'Caelid',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Wandering+Merchant+Caelid+Highway+North',
    complete: true,
    inventory: [
      { name: 'Preserving Boluses', runes: 2500, stock: 3, category: 'consumable' },
      { name: 'Poisonbone Dart', runes: 120, stock: 'infinite', category: 'consumable' },
      { name: 'Poisoned Stone', runes: 150, stock: 'infinite', category: 'consumable' },
      { name: 'Poisoned Stone Clump', runes: 250, stock: 'infinite', category: 'consumable' },
      { name: 'Aeonian Butterfly', runes: 1500, stock: 5, category: 'crafting_material' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Fire Arrow', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
    ],
  },
  {
    name: 'Nomadic Merchant Mt. Gelmir',
    location: 'Ledge halfway up Mt. Gelmir, via ladders from Primeval Sorcerer Azur or Ninth Mt. Gelmir Campsite',
    region: 'Mt. Gelmir',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+Mt.+Gelmir',
    complete: true,
    inventory: [
      { name: 'Stonesword Key', runes: 5000, stock: 1, category: 'key_item' },
      { name: "Nomadic Warrior's Cookbook [20]", runes: 3000, stock: 1, category: 'cookbook' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Great Arrow', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Explosive Bolt', runes: 160, stock: 'infinite', category: 'ammo' },
      { name: 'Ballista Bolt', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Explosive Greatbolt', runes: 800, stock: 'infinite', category: 'ammo' },
      { name: 'Guilty Hood', runes: 500, stock: 1, category: 'armor' },
      { name: 'Confessor Hood', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Confessor Armor', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Confessor Gloves', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Confessor Boots', runes: 1000, stock: 1, category: 'armor' },
    ],
  },
  {
    name: 'Nomadic Merchant West Altus Plateau',
    location: 'Next to Forest-Spanning Greatbridge Site of Grace',
    region: 'Altus Plateau',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+West+Altus+Plateau',
    complete: true,
    inventory: [
      { name: 'Gravel Stone', runes: 2000, stock: 8, category: 'consumable' },
      { name: 'Stonesword Key', runes: 4000, stock: 3, category: 'key_item' },
      { name: "Ancient Dragon Apostle's Cookbook [2]", runes: 4500, stock: 1, category: 'cookbook' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 30, stock: 'infinite', category: 'ammo' },
      { name: 'Lightning Bolt', runes: 160, stock: 'infinite', category: 'ammo' },
      { name: 'Red Crest Heater Shield', runes: 2500, stock: 1, category: 'weapon' },
      { name: 'Scorpion Kite Shield', runes: 2000, stock: 1, category: 'weapon' },
      { name: 'Crossed-Tree Towershield', runes: 3800, stock: 1, category: 'weapon' },
      { name: 'Tree Surcoat', runes: 3500, stock: 1, category: 'armor' },
      { name: 'Note: Unseen Assassins', runes: 2000, stock: 1, category: 'info_item' },
      { name: 'Note: Imp Shades', runes: 1200, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Abandoned Merchant Siofra River',
    location: 'Ruins in Central Siofra River, accessible via eastern wooden scaffolding',
    region: 'Siofra River',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Nomadic+Merchant+Siofra+River',
    complete: true,
    inventory: [
      { name: 'Soap', runes: 400, stock: 3, category: 'consumable' },
      { name: 'Nascent Butterfly', runes: 1500, stock: 5, category: 'crafting_material' },
      { name: 'Stonesword Key', runes: 2000, stock: 3, category: 'key_item' },
      { name: 'Larval Tear', runes: 3000, stock: 1, category: 'key_item' },
      { name: "Nomadic Warrior's Cookbook [17]", runes: 1000, stock: 1, category: 'cookbook' },
      { name: "Nomadic Warrior's Cookbook [18]", runes: 6000, stock: 1, category: 'cookbook' },
      { name: 'Shotel', runes: 2500, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Dwelling Arrow', runes: 160, stock: 30, category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
    ],
  },
  {
    name: 'Hermit Merchant Ainsel River',
    location: 'Stone ruins in southwestern Ainsel River, by campfire',
    region: 'Ainsel River',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Wandering+Merchant+Ainsel+River',
    complete: true,
    inventory: [
      { name: 'Gravity Stone Fan', runes: 200, stock: 20, category: 'consumable' },
      { name: 'Gravity Stone Chunk', runes: 300, stock: 10, category: 'consumable' },
      { name: 'Lost Ashes of War', runes: 3000, stock: 1, category: 'key_item' },
      { name: 'Celestial Dew', runes: 7500, stock: 1, category: 'key_item' },
      { name: "Nomadic Warrior's Cookbook [16]", runes: 2500, stock: 1, category: 'cookbook' },
      { name: "Perfumer's Cookbook [4]", runes: 3000, stock: 1, category: 'cookbook' },
      { name: 'Prisoner Iron Mask', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Prisoner Clothing', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Prisoner Trousers', runes: 1000, stock: 1, category: 'armor' },
    ],
  },
  {
    name: 'Hermit Merchant Leyndell',
    location: "Hermit Merchant's Shack, Capital Outskirts north of Leyndell",
    region: 'Leyndell, Royal Capital',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Hermit+Merchant',
    complete: true,
    inventory: [
      { name: 'Rune Arc', runes: 4000, stock: 3, category: 'consumable' },
      { name: 'Golden Sunflower', runes: 300, stock: 10, category: 'crafting_material' },
      { name: 'Perfume Bottle', runes: 2000, stock: 1, category: 'key_item' },
      { name: "Sentry's Torch", runes: 7000, stock: 1, category: 'weapon' },
      { name: 'Distinguished Greatshield', runes: 5500, stock: 1, category: 'weapon' },
      { name: 'Prophet Blindfold', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Prophet Robe', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Upper-Class Robe', runes: 2400, stock: 1, category: 'armor' },
      { name: 'Prophet Trousers', runes: 1000, stock: 1, category: 'armor' },
      { name: "Consort's Trousers", runes: 1500, stock: 1, category: 'armor' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Golden Arrow', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Great Arrow', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Golden Great Arrow', runes: 500, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Golden Bolt', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Ballista Bolt', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Note: Below the Capital', runes: 800, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Hermit Merchant Mountaintops East',
    location: "South of Stargazers' Ruins, Mountaintops of the Giants",
    region: 'Mountaintops of the Giants',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Hermit+Merchant+Mountaintops+East',
    complete: true,
    inventory: [
      { name: 'Rune Arc', runes: 8000, stock: 3, category: 'consumable' },
      { name: 'Thawfrost Boluses', runes: 1200, stock: 10, category: 'consumable' },
      { name: 'Stonesword Key', runes: 5000, stock: 3, category: 'key_item' },
      { name: "Missionary's Cookbook [7]", runes: 7500, stock: 1, category: 'cookbook' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Great Arrow', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Ballista Bolt', runes: 300, stock: 'infinite', category: 'ammo' },
      { name: 'Lightning Greatbolt', runes: 500, stock: 'infinite', category: 'ammo' },
      { name: 'Vagabond Knight Helm', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Vagabond Knight Armor', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Vagabond Knight Gauntlets', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Vagabond Knight Greaves', runes: 1000, stock: 1, category: 'armor' },
    ],
  },
  {
    name: 'Isolated Merchant Weeping Peninsula',
    location: "Isolated Merchant's Shack, far west of Weeping Peninsula",
    region: 'Weeping Peninsula',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Isolated+Merchant+Weeping+Peninsula',
    complete: true,
    inventory: [
      { name: 'Lantern', runes: 1800, stock: 1, category: 'key_item' },
      { name: 'Arteria Leaf', runes: 1000, stock: 5, category: 'crafting_material' },
      { name: 'Smithing Stone [2]', runes: 400, stock: 3, category: 'smithing_stone' },
      { name: 'Stonesword Key', runes: 2000, stock: 3, category: 'key_item' },
      { name: 'Lost Ashes of War', runes: 3000, stock: 1, category: 'key_item' },
      { name: 'Zweihander', runes: 3500, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Great Arrow', runes: 300, stock: 15, category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Ballista Bolt', runes: 300, stock: 15, category: 'ammo' },
      { name: 'Sacrificial Twig', runes: 3000, stock: 3, category: 'talisman' },
      { name: 'Festering Bloody Finger', runes: 1000, stock: 5, category: 'multiplayer' },
      { name: 'Note: Wandering Mausoleum', runes: 600, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Isolated Merchant Raya Lucaria',
    location: 'Southeast bridge past Main Academy Gate Site of Grace',
    region: 'Liurnia of the Lakes',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Isolated+Merchant+Raya+Lucaria',
    complete: true,
    inventory: [
      { name: 'Festering Bloody Finger', runes: 1500, stock: 8, category: 'multiplayer' },
      { name: 'Fanged Imp Ashes', runes: 2000, stock: 1, category: 'spirit' },
      { name: "Trina's Lily", runes: 1000, stock: 3, category: 'crafting_material' },
      { name: 'Eye of Yelough', runes: 1500, stock: 1, category: 'crafting_material' },
      { name: 'Stonesword Key', runes: 3000, stock: 3, category: 'key_item' },
      { name: 'Lost Ashes of War', runes: 4000, stock: 1, category: 'key_item' },
      { name: "Fevor's Cookbook [2]", runes: 3500, stock: 1, category: 'cookbook' },
      { name: "St. Trina's Arrow", runes: 160, stock: 20, category: 'ammo' },
      { name: 'Meteor Bolt', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Blue Cloth Cowl', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Blue Cloth Vest', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Warrior Gauntlets', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Warrior Greaves', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Sacrificial Twig', runes: 3000, stock: 3, category: 'talisman' },
      { name: "Note: The Preceptor's Secret", runes: 1200, stock: 1, category: 'info_item' },
      { name: 'Note: Revenants', runes: 800, stock: 1, category: 'info_item' },
      { name: 'Note: Frenzied Flame Village', runes: 800, stock: 1, category: 'info_item' },
    ],
  },
  {
    name: 'Isolated Merchant Dragonbarrow',
    location: "Isolated Merchant's Shack, western Dragonbarrow",
    region: 'Dragonbarrow',
    type: 'general_goods',
    sourceUrl: 'https://eldenring.wiki.fextralife.com/Isolated+Merchant+Dragonbarrow',
    complete: true,
    inventory: [
      { name: 'Dragonwound Grease', runes: 3000, stock: 2, category: 'consumable' },
      { name: 'Gravel Stone', runes: 2000, stock: 10, category: 'consumable' },
      { name: 'Ritual Pot', runes: 3000, stock: 1, category: 'key_item' },
      { name: 'Lost Ashes of War', runes: 5000, stock: 2, category: 'key_item' },
      { name: 'Spiked Caestus', runes: 4000, stock: 1, category: 'weapon' },
      { name: 'Arrow', runes: 20, stock: 'infinite', category: 'ammo' },
      { name: 'Serpent Arrow', runes: 120, stock: 'infinite', category: 'ammo' },
      { name: 'Bolt', runes: 40, stock: 'infinite', category: 'ammo' },
      { name: 'Beast-Repellent Torch', runes: 1200, stock: 1, category: 'consumable' },
      { name: 'Land of Reeds Helm', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Land of Reeds Armor', runes: 1500, stock: 1, category: 'armor' },
      { name: 'Land of Reeds Gauntlets', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Land of Reeds Greaves', runes: 1000, stock: 1, category: 'armor' },
      { name: 'Sacrificial Twig', runes: 3000, stock: 3, category: 'talisman' },
      { name: 'Note: Gateway', runes: 1200, stock: 1, category: 'info_item' },
      { name: 'Note: Hidden Cave', runes: 1200, stock: 1, category: 'info_item' },
    ],
  },
];

const doc = JSON.parse(fs.readFileSync(MERCHANTS_PATH, 'utf8'));
const existingNames = new Set(doc.merchants.map(m => m.name));
let added = 0;
let skipped = 0;
for (const m of NEW_MERCHANTS) {
  if (existingNames.has(m.name)) {
    skipped++;
    continue;
  }
  doc.merchants.push(m);
  added++;
}
doc.fetchedAt = '2026-04-22';
doc.note =
  'Expanded: 31 merchants. Stationary + Nomadic + Isolated merchant coverage ' +
  'complete per Fextralife taxonomy. Remaining out of scope: Pidia, Carian ' +
  'Servant (separate Fextralife category); Patches satellite locations ' +
  '(identical inventory to main); Enia (remembrance-trade mechanic). ' +
  'Chest/world pickups and quest rewards pending separate passes.';
fs.writeFileSync(MERCHANTS_PATH, JSON.stringify(doc, null, 2));

console.log('=== Phase B-Merchant nomadic/isolated extension ===');
console.log(`Added ${added} new merchants (skipped ${skipped} already present).`);
console.log(`Total merchants in file: ${doc.merchants.length}`);
const totalItems = doc.merchants.reduce((s, m) => s + m.inventory.length, 0);
console.log(`Total inventory items: ${totalItems}`);
