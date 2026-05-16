#!/usr/bin/env node
// Phase B — canonical gap closing (2026-05-16).
//
// Adds the 14 distinct canonical entries the merchant overlay flagged as
// missing (data/merchant_missing_canonical.json): 11 info-item Notes
// (items.json), 2 ammos St. Trina's Arrow + Lightning Bolt (ammos.json),
// 1 armor Champion Gaiters (armors.json). Also dedups the duplicate
// "Lightning Greatbolt" entry in ammos.json.
//
// Every entry carries Fextralife provenance {verifiedAt, sourceUrl} per the
// project's verify-all-game-data rule. After this runs, re-run
// scripts/phase_b_merchant_overlay.js to attribute merchants[].

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const VERIFIED = '2026-05-16';
const F = 'https://eldenring.wiki.fextralife.com';

function load(f) { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
function save(f, d) { fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2)); }

// --- 11 Notes (info items) -------------------------------------------------
const NOTES = [
  ['Note: Flame Chariots', "Beware the Fire Monks' chariots bearing the faces of giants. A well-aimed blow to the chimney on top may prove effective, but opportunities for a plunging attack will be rare indeed."],
  ['Note: Gravity’s Advantage', 'Gravitational power that pulls can bring flying foes low.'],
  ['Note: Unseen Assassins', 'Some assassins cannot be seen with the naked eye. Seems the Erdtree sentries once carried torches that could cast light on these prowlers.'],
  ['Note: Imp Shades', "Nothing can touch the shades of imps in the heroes' graveyard. Only Rosus's light can give them form."],
  ['Note: Below the Capital', 'Below the royal capital of Leyndell is a vast network of sewers. The well in the city below reaches deep into its tunnels.'],
  ['Note: Wandering Mausoleum', "To stop the mausoleum's stride, you'll need to clean up around its feet first."],
  ['Note: The Preceptor’s Secret', 'Preceptor Seluvis is hiding a dirty secret in a cellar among the ruins not far from the sisters three. The vile Graven Witch seems to be a frequent visitor to that place.'],
  ['Note: Revenants', 'The crawling royal revenants and their followers are all cursed. Healing powers will harm rather than mend.'],
  ['Note: Frenzied Flame Village', 'South of the Grand Lift of Dectus lies the Frenzied Flame Village, inhabited by the sick. Stay well away.'],
  ['Note: Gateway', 'Fort Gael in Caelid houses a gateway that leads to Redmane Castle.'],
  ['Note: Hidden Cave', 'There is a hidden cave in the town of Sellia. Look beyond the graveyard at the precipice.'],
];

// Merchant inventory uses straight apostrophes ("Note: Gravity's Advantage").
// Canonical name must match the merchant string verbatim for the overlay's
// direct match (same precedent as the working "Note: Demi-human Mobs").
function noteName(s) { return s.replace(/’/g, "'"); }

const items = load('items.json');
let addedNotes = 0;
for (const [rawName, desc] of NOTES) {
  const name = noteName(rawName);
  if (items.some(x => x.name === name)) continue;
  items.push({
    name,
    kaggleId: null,
    itemType: 'info',
    sourceType: 'Info Item',
    effect: 'Hint scroll. Reveals a strategy or location tip; no in-game effect when used.',
    description: desc,
    obtainedFrom: null,
    acquisition: null,
    fextralife: { verifiedAt: VERIFIED, sourceUrl: `${F}/${name.replace(/ /g, '+')}` },
  });
  addedNotes++;
}
save('items.json', items);

// --- 2 ammos --------------------------------------------------------------
const ammos = load('ammos.json');

// Dedup "Lightning Greatbolt": two identical-stat entries (fanapis import
// collision). Keep the one with the fuller description, drop the other.
const lgIdx = ammos.map((x, i) => [i, x]).filter(([, x]) => x.name === 'Lightning Greatbolt').map(([i]) => i);
let dedupRemoved = 0;
if (lgIdx.length > 1) {
  const keep = lgIdx.reduce((a, b) => (ammos[b].description || '').length > (ammos[a].description || '').length ? b : a);
  for (const i of lgIdx.slice().sort((a, b) => b - a)) {
    if (i !== keep) { ammos.splice(i, 1); dedupRemoved++; }
  }
}

function addAmmo(a) {
  if (ammos.some(x => x.name === a.name)) return false;
  ammos.push(a);
  return true;
}
let addedAmmo = 0;
addedAmmo += addAmmo({
  name: "St. Trina's Arrow",
  fanapisId: null,
  type: 'Pierce',
  attackPower: { physical: 30, magic: 0, fire: 0, lightning: 0, holy: 0, critical: 100 },
  passive: 'Sleep (96)',
  description: 'Arrow carved to resemble a withered water lily. Afflicts targets with a powerful sleep effect. Priests of St. Trina use these arrows to spread their teachings. The sweet oblivion of sleep can become quite the habit.',
  acquisition: null,
  fextralife: { verifiedAt: VERIFIED, sourceUrl: `${F}/St.+Trina's+Arrow` },
}) ? 1 : 0;
addedAmmo += addAmmo({
  name: 'Lightning Bolt',
  fanapisId: null,
  type: 'Pierce',
  attackPower: { physical: 20, magic: 0, fire: 0, lightning: 80, holy: 0, critical: 100 },
  passive: null,
  description: 'Bolt tipped with a shard of Gravel Stone. Deals powerful lightning damage. Used by worshippers of the ancient dragons.',
  acquisition: null,
  fextralife: { verifiedAt: VERIFIED, sourceUrl: `${F}/Lightning+Bolt` },
}) ? 1 : 0;
save('ammos.json', ammos);

// --- 1 armor --------------------------------------------------------------
const armors = load('armors.json');
let addedArmor = 0;
if (!armors.some(x => x.name === 'Champion Gaiters')) {
  armors.push({
    name: 'Champion Gaiters',
    kaggleId: null,
    category: 'Leg Armor',
    slot: 'legs',
    weight: 3.9,
    dmgNegation: { phy: 3.8, strike: 5, slash: 4, pierce: 4.5, magic: 4.5, fire: 5.4, ligt: 5.8, holy: 5.4 },
    resistance: { immunity: 31, robustness: 20, focus: 26, vitality: 24, poise: 4 },
    setName: 'Champion Set',
    setTier: 'light',
    enginePoise: 4,
    description: 'Gaiters formed only with leather straps. Common wear in the badlands.',
    acquisition: null,
    fextralife: { verifiedAt: VERIFIED, sourceUrl: `${F}/Champion+Gaiters` },
  });
  addedArmor = 1;
}
save('armors.json', armors);

console.log('=== Canonical gap close ===');
console.log(`Notes added to items.json:   ${addedNotes}  (now ${items.length})`);
console.log(`Ammos added to ammos.json:   ${addedAmmo}  (Lightning Greatbolt dupes removed: ${dedupRemoved}; now ${ammos.length})`);
console.log(`Armor added to armors.json:  ${addedArmor}  (now ${armors.length})`);
console.log('Next: node scripts/phase_b_merchant_overlay.js');
