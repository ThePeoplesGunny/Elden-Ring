#!/usr/bin/env node
// Phase B.3.2 — validation report for data/armors.json.
// Read-only. No Fextralife harvest exists yet for armors, so all rows have
// acquisition: null. This script reports:
//   - Slot coverage (head/chest/arms/legs distribution)
//   - Engine overlay coverage (sets, curated pieces)
//   - Poise consistency: engine poise vs resistance.poise (B.2 uncovered weight
//     drift between engine and Fextralife for talismans — same check for armor,
//     engine-internal this time since no Fextralife reference)

const fs = require('fs');
const path = require('path');

const ARMORS_PATH = path.join(__dirname, '..', 'data', 'armors.json');
const ENGINE_PATH = path.join(__dirname, '..', 'tc_next', 'data', 'armor_engine.json');

function main() {
  const armors = JSON.parse(fs.readFileSync(ARMORS_PATH, 'utf8'));
  const engine = JSON.parse(fs.readFileSync(ENGINE_PATH, 'utf8'));

  const bySlot = { head: 0, chest: 0, arms: 0, legs: 0, null: 0 };
  for (const a of armors) bySlot[a.slot || 'null']++;

  const withSet = armors.filter(a => a.setName != null);
  const withEnginePoise = armors.filter(a => a.enginePoise != null);
  const setsRepresented = new Set(armors.filter(a => a.setName).map(a => a.setName));

  // Poise consistency: for pieces with enginePoise set, does resistance.poise match?
  const poiseMismatch = [];
  for (const a of armors) {
    if (a.enginePoise == null) continue;
    if (a.kaggleId == null) continue; // engine-stub, tautologically consistent
    const kagglePoise = a.resistance.poise;
    if (kagglePoise !== a.enginePoise) {
      poiseMismatch.push({ name: a.name, engine: a.enginePoise, kaggle: kagglePoise });
    }
  }

  // Weight consistency: for pieces with engine data, does piece weight match?
  const engineByName = new Map();
  for (const set of engine) {
    for (const slot of ['head', 'chest', 'arms', 'legs']) {
      const p = set.pc && set.pc[slot];
      if (p) engineByName.set(p.n, p);
    }
  }
  const weightMismatch = [];
  for (const a of armors) {
    if (a.kaggleId == null) continue;
    const engP = engineByName.get(a.name);
    if (!engP) continue;
    if (Math.abs((engP.w || 0) - (a.weight || 0)) > 0.01) {
      weightMismatch.push({ name: a.name, engine: engP.w, kaggle: a.weight });
    }
  }

  console.log('=== Phase B.3.2 validation report ===');
  console.log(`Canonical armors: ${armors.length}`);
  console.log();
  console.log('Slot distribution:');
  for (const [slot, count] of Object.entries(bySlot)) {
    console.log(`  ${slot}: ${count}`);
  }
  console.log();
  console.log(`Set linkage (setName non-null): ${withSet.length}/${armors.length} pieces`);
  console.log(`Distinct sets represented in canonical: ${setsRepresented.size}/${engine.length} engine sets`);
  console.log(`Engine poise overlaid: ${withEnginePoise.length} pieces`);
  console.log();
  console.log(`Poise consistency (kaggle resistance.poise vs engine enginePoise): ${poiseMismatch.length} drift`);
  for (const m of poiseMismatch.slice(0, 10)) console.log(`  - ${m.name}: kaggle ${m.kaggle} vs engine ${m.engine}`);
  console.log();
  console.log(`Weight consistency (kaggle weight vs engine piece.w): ${weightMismatch.length} drift`);
  for (const m of weightMismatch.slice(0, 10)) console.log(`  - ${m.name}: kaggle ${m.kaggle} vs engine ${m.engine}`);
  console.log();
  console.log(`Acquisition coverage: 0/${armors.length} — no Fextralife armor harvest yet.`);
  console.log('Pickup: first Fextralife armor harvest batch enables downstream UX.');
}

main();
