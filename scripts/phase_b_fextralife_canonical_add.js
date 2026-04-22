#!/usr/bin/env node
// Phase B-Fextralife canonical additions — fills 3 item-level gaps surfaced
// by the merchant overlay, plus 1 price correction.
//
// Sources (all Fextralife, 2026-04-22):
//   - Assassin's Approach: https://eldenring.wiki.fextralife.com/Assassin%27s+Approach
//   - Missionary's Cookbook [2]: https://eldenring.wiki.fextralife.com/Missionary%27s+Cookbook+%5B2%5D
//   - Sacrificial Twig: https://eldenring.wiki.fextralife.com/Sacrificial+Twig
//
// Script also corrects Patches' Sacrificial Twig price from 5000r to 3000r —
// the per-item Fextralife page says 3000; earlier Patches-page extraction
// misaligned row values.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

function load(f) { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
function save(f, d) { fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2)); }

function addIncantation() {
  const data = load('incantations.json');
  if (data.find(x => x.name === "Assassin's Approach")) {
    return 'already present';
  }
  data.push({
    name: "Assassin's Approach",
    kaggleId: null,
    catalog: 'Incantation',
    school: 'Assassin',
    damageType: null,
    fp: 15,
    slots: 1,
    requirements: { str: 0, dex: 0, int: 0, fai: 10, arc: 0 },
    chargeAble: false,
    motionValue: null,
    castTime: null,
    walkthroughStep: null,
    description: 'Incantation of the assassins who carried out the Night of the Black Knives.',
    effect: 'Silences footsteps and reduces fall damage for ~30 seconds',
    engineNote: null,
    acquisition: null,
    fextralife: {
      verifiedAt: '2026-04-22',
      sourceUrl: 'https://eldenring.wiki.fextralife.com/Assassin%27s+Approach',
    },
  });
  save('incantations.json', data);
  return 'added';
}

function addItems() {
  const data = load('items.json');
  const results = {};

  if (!data.find(x => x.name === "Missionary's Cookbook [2]")) {
    data.push({
      name: "Missionary's Cookbook [2]",
      kaggleId: null,
      itemType: 'cookbook',
      sourceType: 'Cookbook',
      effect: 'Teaches crafting: Scriptstone, Grace Mimic, Gold-Pickled Fowl Foot',
      description: "A missionary's cookbook from the Roundtable Hold era.",
      obtainedFrom: null,
      acquisition: null,
      fextralife: {
        verifiedAt: '2026-04-22',
        sourceUrl: 'https://eldenring.wiki.fextralife.com/Missionary%27s+Cookbook+%5B2%5D',
      },
    });
    results['Missionary\'s Cookbook [2]'] = 'added';
  } else results['Missionary\'s Cookbook [2]'] = 'already present';

  if (!data.find(x => x.name === 'Sacrificial Twig')) {
    data.push({
      name: 'Sacrificial Twig',
      kaggleId: null,
      itemType: 'consumable',
      sourceType: 'Consumable',
      effect: 'Prevents rune loss upon death (consumed on use)',
      description: 'A dried-out talismanic twig. Sacrifices itself to protect accumulated runes on death.',
      obtainedFrom: null,
      acquisition: null,
      fextralife: {
        verifiedAt: '2026-04-22',
        sourceUrl: 'https://eldenring.wiki.fextralife.com/Sacrificial+Twig',
      },
    });
    results['Sacrificial Twig'] = 'added';
  } else results['Sacrificial Twig'] = 'already present';

  save('items.json', data);
  return results;
}

function fixSacrificialTwigPrice() {
  const merchants = load('merchants.json');
  const patches = merchants.merchants.find(m => m.name === 'Patches');
  if (!patches) return 'Patches not found';
  const twig = patches.inventory.find(i => i.name === 'Sacrificial Twig');
  if (!twig) return 'Twig not found';
  const before = twig.runes;
  twig.runes = 3000;
  save('merchants.json', merchants);
  return `Patches Sacrificial Twig runes ${before} -> 3000`;
}

console.log('=== Phase B-Fextralife canonical additions ===');
console.log("Assassin's Approach:", addIncantation());
console.log('Items:', JSON.stringify(addItems()));
console.log('Price fix:', fixSacrificialTwigPrice());
