# Tarnished's Companion — Project Document
## March 28, 2026

---

## PURPOSE

A journey-aware progression plan that connects the player's character creation decision to mathematically optimized moment-to-moment choices through every phase of the game.

The game presents a fixed sequence of regions. Each region ends with a mandatory boss gate. Each boss is defined by its resistance profile across five damage types. The player's build — determined by class, stats, affinities, upgrade cap, and weapon — produces a damage type portfolio. The boss gate tests whether that portfolio penetrates its resistances.

The tool computes, at each regional checkpoint, the player's maximum effective damage through the next boss's resistance profile given their current constraints. The output is a single continuous view showing power trajectory from character creation to the final boss, with boss gates as checkpoints. Where the player's archetype is strong, the tool confirms it. Where a boss gate resists their damage type, the tool identifies the cheapest mitigation.

Every recommendation is computed from datamined game data. The tool makes no claims without computation. Claims without proof are narrative, not logic.

---

## GOVERNING PRINCIPLES

**Computation, not opinion.** Every assertion about weapon quality, build viability, or player guidance is backed by engine output against game data. The tool does not presuppose outcomes.

**The tool calculates. The player decides.** The tool presents computed results. It does not prescribe choices.

**The boss is a resistance filter, not a destination.** The boss gate tests damage type fitness. The journey is the power accumulation between gates. Boss drops and new constraints on the other side of the gate define the next power phase.

**Optimize by region, not by boss.** The unit of optimization is the power phase — the regional checkpoint where the player's stats, affinities, upgrade cap, and weapon pool define their capability. The boss gate validates that capability.

**Weapon availability is modeled by constraints, not by item tracking.** At any checkpoint, the player's stat requirements, unlocked affinities, and upgrade cap determine which weapons are viable. 102 unique weapons are tracked by the walkthrough as specific acquisition points. Common infusable weapons are available by category once stat requirements are met.

**Single continuous view.** The journey is one view, not separate features. Boss readiness, weapon recommendations, tactical needs, and power trajectory are aspects of the same computation rendered contextually.

**Cookbooks are not progression gates.** All tactical needs have non-craft alternatives. Decision final.

**Portable local-first architecture.** Runs entirely on the player's machine. Bundle fits within ~700MB (CD-sized). Small embedded stacks acceptable (SQLite, minimal local file-server, Leaflet + static tiles) when they meaningfully improve maintainability. Criteria: portable (runs from a folder), low maintenance (single-command startup), offline (no cloud/APIs at runtime), cross-platform. Legacy: `Tarnished_Companion_v3.9.html` is the current monolith being migrated to this architecture.

---

## ENGINE DATA

| Data | Count | Source |
|---|---|---|
| Weapons (encoded, all affinity variants) | 2,764 | `ENG_DATA.reg.w` |
| Unique base weapons | 441 | Deduplicated from above |
| Unique weapons tracked in walkthrough | 102 | Matched by name in step text |
| Bosses (full resistance + status + poise) | 173 | `ENG_DATA.bosses` (ph[].rs for status resist, ph[].po for poise) |
| Mandatory boss roster | 13 base + 5 DLC (with region, step, level) | `MANDATORY_BOSSES` |
| Armor sets | 18 | `ENG_DATA.armor` |
| Sorceries | 14 | `ENG_DATA.sorceries` (name, school, type, fp, req, slots) |
| Incantations | 33 | `ENG_DATA.incantations` (name, school, type, fp, req, slots) |
| Spell damage multipliers | 47 | `SPELL_DMG` (community-verified motion values + cast times) |
| Spell acquisition steps | 47 | `SPELL_STEP` (spell name → earliest walkthrough step to obtain) |
| Caster hand loadouts | 9 archetypes | `CASTER_LOADOUT` (RH melee + LH catalyst + notes per caster archetype) |
| Talismans (raw data) | 41 | `ENG_DATA.talismans` (name, effect, value, weight, note) |
| Talisman loadouts | 13 archetypes × 4 | `TALISMAN_LOADOUT` (optimal 4 per archetype, with step/loc/dmgMult/statBonus) |
| Ashes of War | 15 curated | `ASHES_OF_WAR` (damage mult, FP, cast time, availability step) |
| Weapon buffs | 10 | `WEAPON_BUFFS` (incantation/sorcery/consumable buffs) |
| DLC weapon exclusion list | 58 | `DLC_WEAPONS` |
| Enemy resist zones | 2 enemy types, 11 zones | `ENEMY_RESIST` (miners, crystalians at tunnel/cave chokepoints) |
| Walkthrough steps | 1,679 classified | `STEP_CLASS` |
| Step classifications | M 7.4%, P 25.9%, T 0.3%, N 8.5%, C 57.9% | Static tags, promotion computed at render |
| Build-specific P3 tags | 69 | `STEP_ITEMS` |
| Stat templates | 13 archetypes (with affPref + primaryStats) | `STAT_TEMPLATES` |
| Region upgrade caps | 15 | `REGION_CAPS` |
| Whetstones (affinity gates) | 6 | `GATE_WHETSTONES` |
| Bell bearings (upgrade gates) | 9 | `GATE_BELL_BEARINGS` |
| Tactical needs | 10 entries, 13 bosses | `TACTICAL_NEEDS` |
| Achievements | 42 | `ACHIEVEMENTS` |
| Ending prerequisite data | 6 endings | `ENDING_DATA` |
| Quests | 28 | `QUESTS` |
| Regions | 20 base + 10 DLC | `BASE_REGIONS`, `DLC_REGIONS` |
| Rune cost table (lvl 1–100) | 100 | `RUNE_COST_TABLE` (datamined, replaces formula) |
| Weapon acquisition steps | 30 | `WEAPON_STEPS` (weapon name → earliest walkthrough step) |
| Farm targets (rune sources) | 4 | `FARM_TARGETS` (Greyoll, Mohgwyn, Albinaurics, Palace Approach) |

---

## ENGINE FUNCTIONS

| Function | Line | Purpose |
|---|---|---|
| `runeCostForLevel(l)` | 2043 | Rune cost for next level (datamined `RUNE_COST_TABLE`, lvl 1–100; cubic fallback above) |
| `levelsFromRunes(fromLevel, runes)` | 2045 | Inverse: how many levels a rune budget buys from current level |
| `engDecodeW(enc)` | 2061 | Decode weapon (all 26 upgrade levels) |
| `engDecodeWAtLevel(enc, level)` | 2080 | Decode weapon (single level — optimizer use) |
| `engCalcAR(weapon, attrs, upg, 2h)` | 2100 | Compute attack rating (validated 29/29). Damage types 0–4 + status 5–10. |
| `resolveStats(cls, tmpl, lvl)` | 2218 | Class + archetype + level → effective stats |
| `getPlayerBossDmg(bossName, charState)` | 2242 | Single-weapon damage against a specific boss |
| `meetsRequirements(wEnc, stats, 2h)` | 2264 | Pre-decode stat requirement filter |
| `globalOptimize(lvl, includeDLC, opts, weaponList)` | 2279 | Exhaustive Wretch × template × weapon search → top results |
| `bestWeaponForBoss(boss, stats, gate, region, 2h, weaponList)` | 2399 | Top weapons ranked by effective damage (melee + status DPS) |
| `engHP/engFP/engStam/engEquip` | ~2383–2386 | Derived stat curves |
| `engDefenseMult(ratio)` | 2477 | Shared piecewise defense multiplier curve (TD-01). |
| `engDmgVsBoss(arResult, boss, weaponType)` | 2485 | AR through boss defense curve + negation. Physical subtype aware. |
| `engSpellDmgVsBoss(spellScaling, spell, boss)` | 2532 | Spell damage through boss defense + element negation. Uses SPELL_DMG motion values. |
| `bestAshOfWar(template, step)` | 2569 | Top AoW recommendations per archetype and step |
| `availableBuffs(template, stats, step)` | 2598 | Weapon buffs available at given stats/step |
| `getBossPoiseInfo(boss)` | 2618 | Boss poise threshold and stagger difficulty |
| `engStatusVsBoss(arResult, boss)` | 2631 | Status buildup → hits to proc, proc damage. 6 types: poison/rot/bleed/frost/sleep/madness. |
| `availableSpells(stats, type, step)` | 2724 | Filter spells by stat requirements + walkthrough step acquisition (SPELL_STEP) |
| `computeTalismanBonus(templateId)` | 2849 | Optimal loadout → {statBonus, meleeMult, spellMult} applied in progression |
| `deriveGateState(ci, atStep)` | 2942 | Journey checkoffs → unlocked affinities + upgrade caps. Optional atStep for ideal-path. |
| `getNextMandatoryBoss(ci, includeDLC)` | 2976 | Next undefeated mandatory boss from journey checkoffs |
| `bestCatalystAtCheckpoint(stats, gate, region, type, isDLC, weaponList)` | 3009 | Top staves/seals ranked by spell scaling |
| `filterArchPool(weapons, affPref, priStats, excludeDLC)` | 3031 | Shared archetype weapon pool filter (TD-02) |
| `computeProgressionCurve(template, includeDLC, weaponList)` | 3043 | Per-archetype weapon/spell/catalyst progression through all mandatory bosses |
| `computeStatCostToEquip(wEnc, stats, twoHand)` | 3133 | **v3.9** Inverse `meetsRequirements` — stat deltas needed to wield a weapon |
| `vigFloorForBoss(bossLevel)` | 3171 | **v3.9** Survivability floor (vigor) scaled to boss level — prevents one-shot builds |
| `optimizeStats(params)` | 3203 | **v3.9** Greedy coordinate-ascent stat allocator. ~320 evals × 0.025ms ≈ 8ms. Three presets. |
| `computeWeaponValue(wEnc, stats, gateState, target, twoHand)` | 3299 | **v3.9** Generalized damage eval (melee + status + spell DPS) for choice scoring |
| `evaluateChoices(charData, ci, includeDLC)` | 3345 | **v3.9** Enumerate ranked player actions with costs/outcomes (near-miss equips, farm runs, levels) |
| `rankActions(actions, nextBoss, stats, level, gateState)` | 3448 | **v3.9** Score and order candidate actions for Recommended Actions panel |
| `resolveTacticalNeeds(bossName, ci)` | 3529 | Boss + checkoffs → tactical mitigation options |
| `getEnemyResistWarning(step, charState)` | 3600 | Step + equipped weapon → enemy resist warnings with strike weapon rec (E4) |
| `isBuildRelevant(itemScaling, archetype)` | 3645 | STAT_TEMPLATES lookup → build-relevance filter (TD-03) |
| `endingAvailability(ci, qp)` | 3793 | Checkoffs + quest progress → ending status |

*Note: `detectBuildArchetype` removed v3.9 — `charData.archetype` is explicitly set, no inference fallback needed.*

---

## FILE STRUCTURE

**Active baseline (v4.0.0-alpha, Phase A complete 2026-04-20):** `tc_next/` portable bundle
  - `tc_next/index.html` — shell, loads React vendor + legacy_inline + main
  - `tc_next/app/legacy_inline.js` — 1.3MB verbatim port of legacy inline script (split into views in Phase D)
  - `tc_next/app/main.js` — mount shim with error boundaries
  - `tc_next/app/vendor/react.production.min.js` + `react-dom.production.min.js` — React 18.2.0 UMD bundled locally
  - `tc_next/engine/legacy_bundle.js` — 55.9KB, 46 engine functions + 66 data constants, node-loadable via `require()`
  - `tc_next/data/*.json` — 72 files (2.35MB) engine-subset canonical data (to be expanded in Phase B)
  - `tc_next/start.{py,js,bat,sh}` — cross-platform launchers (Python preferred, Node fallback)
  - Runs via `python start.py` (or double-click `start.bat`) → http://127.0.0.1:8000
  - Parity with legacy HTML: 93/93 PASS (`scripts/phase_a_parity.js`)

**Legacy baseline (preserved for reference):** `Tarnished_Companion_v3.9.html` | **Lines:** 5,893 | **Size:** ~1.4 MB

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline data (DO NOT LOAD)** | **69–2003** | Regions, ENG_DATA (weapons, bosses, sorceries, incantations, talismans), ENG_GRAPHS |
| Engine constants | 2004–2018 | evalCCGraph, ENG_GRAPHS, WRETCH/WRETCH_BASE_TOTAL/WRETCH_LEVEL |
| **Rune cost system (v3.9)** | **2019–2022** | RUNE_COST_TABLE (datamined lvl 1–100), runeCostForLevel, levelsFromRunes |
| Core engine functions | 2024–2418 | engDecodeW, engCalcAR, resolveStats, meetsRequirements, globalOptimize, bestWeaponForBoss |
| Derived stat lookups + ammo | ~2383–2418 | _dsKeys, _dsLookup, engHP/FP/Stam/Equip, PHYS_SUBTYPE, AMMO_DATA (30) |
| engDefenseMult + engDmgVsBoss | 2433–2456 | Shared defense curve (TD-01), physical subtype aware |
| Spell damage system | 2488–2520 | SPELL_DMG (47 motion values), engSpellDmgVsBoss |
| Ashes of War | 2525–2550 | ASHES_OF_WAR (15 curated), bestAshOfWar |
| Weapon buffs | 2554–2570 | WEAPON_BUFFS (10 entries), availableBuffs |
| Poise/stagger | 2574–2585 | STAGGER_TIER, STAGGER_LABELS, getBossPoiseInfo |
| Status effect system | 2587–2670 | STATUS_TYPES, STATUS_PROC_DAMAGE, engStatusVsBoss |
| Spell system | 2680–2800 | SPELL_STEP (47 spells), CASTER_LOADOUT (9 archetypes), availableSpells (stat+step gated) |
| Talisman loadouts + engine | ~2730–2895 | TALISMAN_LOADOUT (13 archetypes × 4), computeTalismanBonus |
| Character system data | ~2810–2895 | REGION_CAPS, BOSS_READY, GATE_WHETSTONES (6), GATE_BELL_BEARINGS (9) |
| Gate + progression functions | 2898–3088 | deriveGateState, getNextMandatoryBoss, DLC_WEAPONS, bestCatalystAtCheckpoint, filterArchPool, computeProgressionCurve |
| **Stat optimizer (v3.9)** | **3089–3253** | computeStatCostToEquip, vigFloorForBoss, optimizeStats (greedy coordinate ascent, 3 presets) |
| **Choice evaluation engine (v3.9)** | **3255–3447** | computeWeaponValue, evaluateChoices, rankActions |
| Tactical needs | 3448–3503 | TACTICAL_NEEDS, resolveTacticalNeeds |
| Enemy resist (E4) | 3505–3593 | ENEMY_RESIST (2 enemies × 11 zones), getEnemyResistWarning |
| **Choice data (v3.9)** | **3511–3593** | FARM_TARGETS (4), WEAPON_STEPS (30) — interleaved with enemy resist section |
| Step classification data | ~3595–3602 | STEP_CLASS, CLASS_LABELS, STEP_ITEMS, isBuildRelevant (TD-03) |
| Class/stat constants | 3604–~3640 | CLASSES, STAT_NAMES/LABELS/DESC, SOFT_CAPS |
| App core | 3644–3670 | STORAGE_KEY, storage{}, color palette C{} |
| Achievements + Endings | 3671–3940 | 42 achievements, 6 endings, ENDING_DATA, endingAvailability (3747) |
| UI constants + helpers | 3941–3957 | DASH_CATS, h(), btnS(), ProgressRing, ProgressBar |
| **App component** | **3958–5800** | 24+ useState hooks. charData.archetype, stat optimizer state, recommended actions panel state. |
| renderCharacter (+ nested) | 4127–5028 | renderProfile (4216), renderLoadout (4268, E3 breakpoints +1–5), renderRespec (4776), renderAR (4819) |
| renderWalkthrough | 5030–5232 | Step cards, power gate banner (F2), enemy resist warnings (E4), boss readiness inline, level warnings (Larval/Darriwil) |
| renderDashboard | 5234–5385 | Next Objective panel (F3), Recommended Actions panel (v3.9), walkthrough progress, endings |
| Other tabs (compact) | 5387–5443 | renderAchievements (5388), renderBosses (5390), renderEndings (5392), renderQuests (5438), renderCollectibles (5440), renderSettings (5442) |
| renderCompare | 5445–5588 | B2 fix, hooks-compliant |
| renderOptimizer | 5590–5800 | Dynamic weapon count, 13 archetypes |
| Main render + tab routing | 5802–5840 | TABS, renderers |
| Mount | 5844 | ReactDOM.render |
| Close | 5845–5846 | |

---

## PHASE B DATA INGESTION

Per REWRITE_PLAN §5 Phase B. Canonical DB-of-record files at `data/*.json`.
These are the source-of-truth, independent of `tc_next/data/*.json` (engine
runtime, Phase A output, parity-verified untouched).

**Status as of 2026-04-21:** B.1–B.7 complete — all 7 phases shipped.

### Canonical data files

| File | Rows | Source | Engine overlay | Fextralife harvest | Commit |
|---|---|---|---|---|---|
| `data/weapons.json` | 306 | deliton (307 − 1 dup) | 238/306 in engine | 56/306 | `69bb4eb` |
| `data/talismans.json` | 98 | deliton (87) ∪ engine (+11 stubs) | 41/98 | 21/98 | `54f5fe6` |
| `data/armors.json` | 570 | Kaggle (566) ∪ engine (+4 Verdigris stubs) | 71/570 | 0/570 | `af356bf` |
| `data/sorceries.json` | 72 | Kaggle (71) ∪ engine (+1 stub: Terra Magica) | 14/72 | 0/72 | `4900c51` |
| `data/incantations.json` | 110 | Kaggle (98) ∪ engine (+12 stubs incl. Golden Vow, Catch Flame) | 33/110 | 0/110 | `4900c51` |
| `data/ashes_of_war.json` | 90 | Kaggle (89, 1 excluded) ∪ engine (+1 stub) | 15/90 | 0/90 | `f47d590` |
| `data/spirits.json` | 64 | Kaggle (64) | none | 0/64 | `9e1c5c1` |
| `data/items.json` | 447 | Kaggle (462 − 15 dup) | none | 0/447 (42 Kaggle hints) | `803416c` |
| `data/bosses.json` | 105 | fanapis (106 − 1 bad dup) | — | 207 drop mappings | `07e460b` |
| `data/npcs.json` | 55 | fanapis | — | location+role only | `07e460b` |
| `data/locations.json` | 177 | fanapis | — | descriptive only | `07e460b` |
| `data/merchants.json` | 14 merchants / 153 items | Fextralife per-merchant | — | merchant inventories + specialists | `5bbd0e9` / pending |
| `data/shields.json` | 69 | fanapis | — | — | pending |
| `data/ammos.json` | 53 | fanapis | — | — | pending |

**Totals:** 14 files, 2,219 canonical rows + 113 merchant inventory items, ~1.5MB. Merchant overlay now 113/113 (100%) — 95 unique canonical items carry `merchants[]` attribution; 0 canonical gaps remaining.

### Ingestion pipeline pattern (generalized across B.1–B.6)

Per-phase: `scripts/phase_bN_ingest_<class>.js` → optional `_merge_acquisition.js`
→ optional `_validate_<class>.js`. Two or three scripts per class.

Cross-cutting conventions established:
- **Canonical = source ∪ engine** — when engine has a curated subset with unique
  fields deliton/Kaggle lack (weight, parsed effect enums, set linkage, etc.),
  add engine-only entries as stubs (`kaggleId: null` / `delitonId: null`) so
  canonical is a proper union, not an intersection.
- **Name normalization** — case-insensitive match against engine canonical form;
  manual `NAME_CORRECTIONS` map for punctuation-only drift (e.g., "Sword Of St
  Trina" → "Sword of St. Trina").
- **Fextralife wins on overlap** — harvested entries (verified) override deliton
  and engine values for requirements, scaling, weight, etc.
- **Positional assignment for dirty structured fields** — armor dmgNegation and
  resistance arrays had corrupted slot names (StrEldenike, 6.1, VS, Pose,
  Vitality26, Death) but consistent array order; fix by position, not by key.
- **Report drift, don't auto-fix** — validation scripts log mismatches between
  Kaggle/deliton and engine (poise, weight, requirements) without mutating
  data. Fextralife harvest arbitrates.
- **Derived discriminators when source categorisation is unreliable** — B.7
  items source `type` was corrupted by column bleed (scaling letters, weights,
  shield guard strings) across ~21 rows plus 178 blank/dash values. Rather
  than trust source, a 14-value `itemType` discriminator is derived from
  name + effect + description patterns: `flask`, `crystal_tear`, `key`,
  `throwable`, `consumable`, `crafting_material`, `cookbook`, `rune`, `grease`,
  `remembrance`, `online`, `reusable`, `note`, `misc`. Source `type` preserved
  as `sourceType` for audit trail. Final misc bucket: 4.0% (18/447) — genuine
  outliers (Torch misfile, Grace Mimic, Margit's Shackle, etc.).

### Known data-quality issues surfaced by ingestion

**Kaggle/deliton source corruption (not Claude's bugs — source data issues):**
- Weapons: `Sword Of St Trina` missing period; `Bandit's Curved Sword` has
  `sp:undefined` (still open from B11 era)
- Weapons: 20 requirement drifts where deliton dropped `{name:"",amount:X}`
  malformed empty-name entries (Siluria's Tree Fai=20, Sword of St. Trina
  Int=14, Marika's Hammer dex=12/fai=19, etc.) — engine authoritative
- Armors: 52 poise drifts + 58 weight drifts between Kaggle and engine —
  looks like two game-patch snapshots disagreeing (Black Knife Armor:
  kaggle poise 14 vs engine 10)
- Incantations: Ancient Dragons' Lightning Spear kaggle fai=0 (impossible);
  5 incantations with all-zero requirements (data error)
- Ashes: `Lost Ashes of War` miscategorized — it's a crafting consumable,
  not an AoW; excluded from B.5, re-homed to `data/items.json` in B.7
  (name-corrected `Lost Ashes Of War` → `Lost Ashes of War`, `itemType: misc`)
- AoW: 88/90 rows needed `Ash Of War` → `Ash of War` case fix
- Items: `type` column in Kaggle `items.csv` is dirty — 27 distinct values
  including scaling-letter strings (`Str A Dex C`), weight values (`0.7`),
  and shield guard-stat strings (`Guard Phy 21 Mag 15…`) leaking from other
  columns. 178 blank/dash values, 1 `n/a`, 1 empty. Worked around by deriving
  an `itemType` discriminator from name + effect + description patterns rather
  than trusting source `type`. Source `type` preserved as `sourceType` for audit.
- Items: 15 Kaggle source duplicates (same name, two IDs) for
  Furlcalling Finger Remedy, Memory of Grace, Remembrance of the Black Blade,
  Spirit Calling Bell, Tailoring Tools, Memory Stone, Furled Finger's Trick-mirror,
  Irina's Letter, Chrysalids' Memento, Dragon Heart, Prattling Pate "apologies",
  Wraith Calling Bell, Whetstone Knife, Map (Weeping Peninsula), Glintstone Scrap.
  Each is a single in-game item; first-seen kept.

**Engine coverage gaps (canonical has rows, engine doesn't):**
- 31 weapons truly absent from `tc_next/data/weapons_encoded.json`
  (10 Glintstone staves, Hand of Malenia, Serpentbone Blade, Shotel, Cane
  Sword, Winged Spear, Rotten Greataxe, Golden Order Seal, Giant's Seal, etc.)
- 17 weapons in engine name list but no base-variant (affinity -1 or 0)
  in encoded pool — edge cases in affinity encoding
- 499 armors not in engine (engine only curates 19 sets × ~4 pieces = 71)

**Fextralife harvest priority list (original — largely obsoleted by Phase B-Overlay):**
1. Weapons expansion: 56 → 306 (all post-Limgrave regions)
2. Talismans expansion: 21 → 98
3. **Armors first-ever harvest: 0 → 570** (highest value — resolves 52+58 drift cases)
4. Spells first-ever harvest: 0 → 182
5. AoW first-ever harvest: 0 → 90
6. Spirits first-ever harvest: 0 → 64
7. Items first-ever harvest: 0 → 447 (42 Kaggle `obtainedFrom` hints available as head-start)

### Phase B-Overlay (fanapis snapshot, 2026-04-22)

**Shipped.** `scripts/phase_b_overlay_fanapis_snapshot.js` pulls
https://eldenring.fanapis.com (deliton/eldenring-api backing) across 11
endpoints → `data/fanapis/*.json`. One script, one run, 2,085 rows, 1.9MB.

| Endpoint | Rows | File |
|---|---|---|
| weapons | 307 | `data/fanapis/weapons.json` |
| armors | 568 | `data/fanapis/armors.json` |
| talismans | 87 | `data/fanapis/talismans.json` |
| sorceries | 71 | `data/fanapis/sorceries.json` |
| incantations | 98 | `data/fanapis/incantations.json` |
| ashes_of_war | 90 | `data/fanapis/ashes_of_war.json` (endpoint: `/api/ashes`) |
| spirits | 64 | `data/fanapis/spirits.json` |
| items | 462 | `data/fanapis/items.json` |
| bosses | 106 | `data/fanapis/bosses.json` (**carries `drops[]`**) |
| npcs | 55 | `data/fanapis/npcs.json` (location + role, no inventory) |
| locations | 177 | `data/fanapis/locations.json` |

**Schema findings (pilot-verified before bulk ingest):**
- Armors have clean `Poise` in `resistance[]` — resolves 52 poise + 58 weight
  drift cases (Black Knife Armor poise=14 in fanapis, matches Kaggle, not engine).
- Weapons expose `requiredAttributes[]`, `scalesWith[]`, `attack[]`, `defence[]`,
  `weight` — resolves the 20 empty-name req drifts from deliton.
- **Bosses carry `drops[]`** — `~106 bosses × ~2 drops = ~200 item-to-boss
  acquisition mappings`, free. This is the single biggest acquisition payload
  we've ever ingested in one shot.
- NPCs only carry `location` + `role` — merchant inventories NOT included.
  What Kalé/Twin Maiden Husks sell still needs a separate source.
- Locations are descriptive only — no join to items/bosses/NPCs.

**What fanapis does NOT solve (still needs Fextralife or equivalent):**
- Incantation requirement bugs — fanapis inherits the same source errors
  (Ancient Dragons' Lightning Spear fai=0 confirmed identical to Kaggle).
- Merchant inventory, chest pickups, quest rewards, world-pickup map coords.
- Any case where Kaggle/deliton/engine all disagree and none is right —
  would need the ThomasJClark `regulation-vanilla-v1.14.js` game-file drop.

**Meta-caveat:** fanapis is community-run (same source family as Kaggle/deliton),
not game-file-authoritative. It's "Kaggle done right" — structurally clean,
same underlying data. Snapshot lives locally; API dependency is one-shot,
not runtime.

### Phase B-Overlay-Merge — new canonicals from fanapis (2026-04-22)

Three brand-new canonical entities created from the fanapis snapshot:

- `data/bosses.json` — 105 bosses (1 dup blacklisted: "Alecto Black Knife
  Ringleader" non-comma variant had wrong location/runes), 207 item drop
  mappings, 97 rune values. Normalizes fanapis stringly-typed `drops[]`:
  parses rune formats (`10.000` / `5,400` / `6000` → integer), splits
  comma-concatenated multi-drops (Ancient Hero of Zamor: 6 items in one
  source string), filters garbage (`Other Drops`, `???`, `N/A`, bare
  numbers from mangled rune splits). Script:
  `scripts/phase_b_overlay_ingest_bosses.js`.
- `data/npcs.json` — 55 NPCs, 53 with roles, 7 merchant-like. No inventory
  data (fanapis doesn't carry it). Script:
  `scripts/phase_b_overlay_ingest_npcs.js`.
- `data/locations.json` — 177 locations across 7 regions (Liurnia of the
  Lakes 46, Limgrave 37, Altus Plateau 30, Caelid 24, Weeping Peninsula 17,
  Mountaintops 17, Dragonbarrow 6). Description-only, no joins. Script:
  `scripts/phase_b_overlay_ingest_locations.js`.

**Validation shipped** (2026-04-22, `scripts/phase_b_overlay_validate.js` +
`data/fanapis/drift_report.json`). Canonical is already aligned with fanapis
across all classes — drift is near-zero:

| Class | Matched | Drift | notFound (engine stubs) |
|---|---|---|---|
| armors | 568/568 | poise=1, weight=1 (Redmane Knight Helm only) | 4 |
| weapons | 287/306 | req=5 (2 empty-key fanapis-wins, 3 canon-has-extra) | 20 |
| sorceries | 69/72 | 0 | 3 |
| incantations | 107/110 | 0 | 3 |
| talismans | 91/98 | 0 (effect text identical) | 7 |
| ashes_of_war | 88/90 | 0 (case-insensitive match bridges canonical's `Of`→`of` normalization) | 2 |

**Interpretation:** The originally-feared "52 poise + 58 weight" armor drift
from B.3 was canonical-Kaggle vs engine-stored `enginePoise` field — a
drift between two snapshots in the same canonical file, not a blocker
between canonical and authoritative truth. Fanapis confirms Kaggle/canonical
side is correct; engine's `enginePoise` overlay is stale (older game patch).

**Fextralife drift patch shipped 2026-04-22** (`scripts/phase_b_fextralife_drift_patch.js`):
Applied 11 targeted corrections from Fextralife wiki pages:

- **5 incantations with all-zero requirement bugs** (B.4 data error):
  - Ancient Dragons' Lightning Spear (fai 0→32), Glintstone Breath
    (fai 0→15, arc 0→12), Law of Causality (int 0→29 — flagged for
    in-game verification, unusual for incantation), Order Healing
    (int 0→11, fai 0→11), Vyke's Dragonbolt (fai 0→23).
- **1 armor poise/weight** — Redmane Knight Helm: canon/fanapis/Fextralife
  all three disagreed; Fextralife poise=8, weight=5.1 authoritative.
- **5 weapon req corrections**: Siluria's Tree (+fai=20), Treespear
  (+fai=18) resolved the deliton empty-name source corruption; Grave
  Scythe, Spiked Spear, Noble's Slender Sword had canon values correct
  but fanapis missing dex — no canon change, just Fextralife confirmation
  logged.

Each patched entry now carries a `fextralife: {verifiedAt, sourceUrl}`
audit trail. Post-patch drift report still shows ~6 cases — these are
now canon-right/fanapis-wrong inversions (fanapis's `requiredAttributes[]`
has empty-name or missing-dex source bugs). Canonical is authoritative
for all 11 patched entries.

**Merchant inventories harvested 2026-04-22** (`data/merchants.json`, 8
merchants, 113 inventory items):

- Kalé (18), Twin Maiden Husks (6 sample, bell-bearing-gated full
  inventory is ~300+), Miriel (26), Brother Corhyn (20), Sellen (13),
  Thops (3, partial — wiki table returned incomplete), Knight Bernahl
  (12), Patches (15).
- First-pass cross-reference to canonical: 93/113 matched (82%) by
  exact name. 20 unmatched fell into 9 normalizable and 11 canonical-gap
  categories.
- **Merchant overlay shipped 2026-04-22** (`scripts/phase_b_merchant_overlay.js`):
  9 name normalizations (bracket style `(N)`→`[N]`, colon-to-parens
  for `Note:` prefix items, `of`→`Of` casing for Law of Regression /
  Gold-Pickled Fowl Foot / Ash of War: Stamp (upward Cut)) bridged the
  fixable gaps. Now 102/113 merchant items attributed to canonical
  (86 unique items — 16 items sold by 2+ merchants). Each matched
  canonical entry carries `merchants[]` array with full attribution
  (merchant, location, region, runes, stock, prereq, sourceUrl).
- `data/merchant_reverse_index.json` — item→merchants lookup for
  direct engine consumption.
- `data/merchant_missing_canonical.json` — 11 items sold by merchants
  but absent from canonical:
  - **ammo (4)**: Arrow, Bolt, Great Arrow, Ballista Bolt — canonical
    gap; ammo lives only in engine's `ammo_data.json`. Fanapis has
    `/api/ammos` endpoint not yet snapshotted.
  - **shields (2)**: Large Leather Shield, Horse Crest Wooden Shield —
    canonical has zero shields. Fanapis has `/api/shields` endpoint
    not yet snapshotted.
  - **incantation (1)**: Assassin's Approach — real Kaggle/deliton/engine
    gap.
  - **cookbook (1)**: Missionary's Cookbook (2) — real items.json gap
    (canonical has [1], [3], [4], [5], [7] but not [2]).
  - **consumable (1)**: Sacrificial Twig — real items.json gap.
  - **duplicate merchant attributions (2)**: 2nd mention of
    Assassin's Approach + 2nd mention of Law Of Regression — same
    missing canonical entries, multiple merchants.

**Canonical gaps closed 2026-04-22** (`scripts/phase_b_overlay_ingest_shields.js`,
`phase_b_overlay_ingest_ammos.js`, `phase_b_fextralife_canonical_add.js`):
- `data/shields.json` (69) — straight fanapis ingest, first shield catalog
  ever (canonical `weapons.json` excluded shields entirely).
- `data/ammos.json` (53) — straight fanapis ingest, superset of engine's
  30-entry `ammo_data.json`.
- Added 3 item-level entries: Assassin's Approach (incantations.json),
  Missionary's Cookbook [2] (items.json), Sacrificial Twig (items.json),
  each with `fextralife: {verifiedAt, sourceUrl}` audit.
- Corrected Patches' Sacrificial Twig price 5000→3000 in merchants.json
  (Fextralife per-item page is authoritative over per-merchant table).
- Extended `phase_b_merchant_overlay.js` to include shields + ammos
  canonicals in its index, added Missionary's Cookbook normalization.
- **Post-patch merchant overlay: 113/113 matched (100%)**, 95 unique
  canonical items carry `merchants[]`, 0 canonical gaps.

**Merchants extended to specialists 2026-04-22** (`scripts/phase_b_merchant_extend_specialists.js`):
Added 6 merchants completing stationary-vendor coverage:
- Sorcerer Rogier (Roundtable Hold, AoW vendor, 3 items — questline-limited)
- Gowry (Caelid, sorcery vendor, 4 items — Millicent-quest-gated)
- Preceptor Seluvis (Three Sisters, sorcery vendor 10 + **spirit-ash
  puppet shop 4** — puppets use Starlight Shards currency, not runes)
- D, Hunter of the Dead (Roundtable Hold, 2 incantations — unlocks after
  visiting Gurranq)
- Gurranq, Beast Clergyman (Bestial Sanctum, 9 **Deathroot trades** —
  cumulative counter, Clawmark Seal at 1 Deathroot through Ancient
  Dragon Smithing Stone at 9)
- Imprisoned Merchant (Mohgwyn Dynasty Mausoleum, 8 items)

Schema extended with `specialCost: {amount, currency}` for non-rune
currencies (Starlight Shards, Deathroot). Four new normalizations
added to overlay: `Litany of Proper Death`/`Stone of Gurranq`/
`Dolores the Sleeping Arrow Puppet` case drifts, plus
`Ash of War: Beast's Roar` variant.

**Canonical typo fixed**: `Gurrang's Beast Claw` → `Gurranq's Beast Claw`
in `incantations.json` (source data had missing second `r`).

**Post-extension merchant overlay: 153/153 matched (100%)**, 124
canonical items carry `merchants[]`, 0 canonical gaps. Schema now
covers 14 merchants across general/spell/AoW/spirit/special-trader
types.

**Out of scope**: Nomadic Merchants (~11 region-scattered), Isolated
Merchants (~6), Hermit Merchant (Altus), Patches at satellite
locations (same inventory), Smithing masters (no shop), Enia (boss-
remembrance trades — separate mechanic), Boc (cosmetic alterations —
no inventory), Roderika (spirit tuning service — no shop), Hyetta
(maiden — no shop). Most are either tiny inventories or region/service
mechanics best covered by per-region harvest.
- **Out of scope for this pass:** Nomadic Merchants (~11 region-scattered),
  Isolated Merchants (~6), Hermit Merchant, Pidia, Imprisoned Merchant,
  Gatekeeper Gostoc, Gowry, D, Preceptor Seluvis, Rogier, Gurranq,
  Roderika, Boc, Enia, Smithing masters. Most of these overlap with
  per-region chest/pickup harvest or have trivial one-item inventories.

### Phase B remaining

**None.** B.1–B.7 + B-Overlay (snapshot + new canonicals + validate) all
shipped 2026-04-22. Canonical data baseline is stable and cross-validated
against fanapis source family.

Next work options:
- **Fextralife (scoped)** — only for what fanapis can't provide: merchant
  inventories, chest/world pickups, quest rewards, incantation req bug
  fixes (5 all-zero-req spells), plus the ~6 individual drift cases
  flagged in the validate report. Much smaller scope than the original
  570-page harvest.
- **Phase C/D** per `REWRITE_PLAN.md` (unblocks live playtest — tc_next
  journey view is the current blocker on resuming R4 Limgrave playtest).

---

## IMPLEMENTATION STATE

### What's built and working (engine v3.15 + architecture v4.0.0-alpha, Phase A–B.7)

**Active:** `tc_next/` portable bundle | **Legacy preserved:** `Tarnished_Companion_v3.9.html` (5,893 lines)

Everything from v2.0 plus:

**v3.9 additions:**
- **Stat allocation optimizer** (Character tab): `optimizeStats` greedy coordinate ascent. Allocates points one at a time at the highest marginal score. Soft caps emerge from scaling curves, not hardcoded rules. Scoring combines weapon damage, status DPS, spell DPS, log(HP), log(stamina/FP). Three presets (Aggressive / Balanced / Tanky). `vigFloorForBoss` enforces survivability floor scaled to boss level. Auto-tests top 3 weapon candidates per archetype. ~8ms per optimization.
- **Choice evaluation engine** (Dashboard "Recommended Actions" panel): `evaluateChoices` + `rankActions` enumerate ranked player actions with costs and outcomes. Turns null checks into near-miss math — instead of "can't equip," reports "2 STR to equip Morning Star (strike + bleed)." `computeStatCostToEquip` is the inverse of `meetsRequirements`. `computeWeaponValue` is the generalized damage scoring used by both optimizer and choice ranker.
- **Rune cost correction**: `runeCostForLevel` replaced wrong cubic formula with datamined `RUNE_COST_TABLE` (lvl 1–100). Old formula produced ~40% of actual costs; 80K runes now correctly shows 38 levels (was 100). `levelsFromRunes` provides the inverse for farm-target evaluation.
- **Walkthrough early-game fixes**: Map fragments (steps 33, 46), Lordsworn's Greatsword (34) and Flail (35) at Gatefront, Crimson Crystal Tear (72), Bestial Sanctum portal (73), level warnings on Larval Tear (60) and Darriwil (62). Boc description fixed, redundant Kalé step removed, Whetstone Knife typo, Ranni/Spirit Bell renumbered.
- **Greyoll path optimization**: `FARM_TARGETS` Greyoll moved from step 1264 to step 73 (portal access via Bestial Sanctum, not geographic walking).
- **Level-Up Advisor breakpoint scan**: expanded from +1 to +1–5 range with weapon availability gating.
- **`detectBuildArchetype` removed**: charData.archetype is now explicitly set; inference fallback dropped.

**Weapon Analysis Panel** (renderLoadout): Computes AR for equipped weapons across all affinities in ENG_DATA. Shows single recommendation (best weapon + affinity + upgrade level). Current vs Optimal side-by-side. Hits-to-kill (melee + status DPS) against next boss gate. Collapsible detail for alternatives. Flags locked affinities with instructions to obtain whetstone. Tactical needs displayed below.

**Next Level-Up Advisor** (renderLoadout): Computes value of +1 in all 8 stats against equipped weapon and next boss. Recommends VIG until 20, then highest damage stat (unlocks as tiebreaker). Per-stat breakdown: AR gain, damage gain, HP gain, stamina gain, weapon unlocks. E3 breakpoint scan: filters archetype weapons via meetsRequirements, shows which weapons become usable at +1 in each stat.

**Archetype Selection** (renderProfile): Persistent archetype dropdown (13 STAT_TEMPLATES + Undecided) saved to charData.archetype. Drives weapon curve, breakpoint scan, and Journey tab item filtering.

**Progression System** (v3.3–3.4): Full archetype progression through all mandatory bosses. Weapon curve table merged into AR Estimator tab (v3.4). Progression subtab removed.
- `computeProgressionCurve`: Walks 13 archetypes through 13+5 boss gates with optimal weapon per checkpoint
- **Archetype affinity filtering**: Weapons filtered by archetype fit (Heavy for STR, Magic/Cold for INT, etc.)
- **Caster catalyst system**: INT/FTH builds show staff/seal ranked by spell scaling, melee as backup
- **Spell DPS model**: 47 spells with motion values → damage × defense × negation → DPS ranking per boss
- **Status effect integration**: Bleed/frost/poison/rot/sleep computed from weapon buildup vs boss resistance
- **Effective damage ranking**: bestWeaponForBoss now ranks by melee + status DPS combined
- **Ashes of War**: 15 curated weapon skills with damage, FP cost, availability by step
- **Weapon buffs**: 10 buff entries (incantations, greases, consumables) filtered by stats/step
- **Talismans**: Optimal 4-talisman loadout per archetype (13 loadouts) with locations. Stat bonuses applied to AR calc, damage multipliers applied to melee and spell DPS in progression engine. DLC assessed — base game loadouts are optimal.
- **Poise/stagger**: Boss poise from data + weapon stagger tier → difficulty assessment
- **DLC weapon gating**: 58 DLC weapons excluded from base game boss recommendations
- **Enemy resistance warnings** (E4): Curated problem enemy data (miners, crystalians) across 11 tunnel/cave zones. Detects when player's equipped weapon type is resisted, recommends best available strike weapon.
- **Power-gated walkthrough** (F2): Warning banner when player is underpowered for region
- **Next Objective** (F3): Dashboard panel showing next boss, readiness, best weapon, power budget

**Core engine (from v2.0):** AR calculation validated 29/29. Piecewise defense model. Derived stat curves. Class optimizer. Physical subtype negation (slash/strike/pierce).

**Walkthrough system:** 1,679 steps classified. Focused mode (M/P/T only). Build-aware dimming for 69 P3 items.

**Progression gates:** 6 whetstones → affinity unlocks. 9 bell bearings → upgrade caps. Gate state derived from journey checkoffs, extendable with `atStep` for ideal-path simulation.

**Boss readiness:** 27 bosses with thresholds (13 base + 5 DLC + 9 optional). Equipped weapon → AR → boss defenses → hits-to-kill → badge.

**Tactical needs:** 10 entries across 13 bosses. Multi-provider resolution.

**Endings:** 6 endings with lockout detection. Frenzied Flame override, Seluvis Potion lockout, Seedbed Curse math, Law of Regression gate.

**Save system:** Versioned JSON export/import.

**UI:** 20+ React components. Tabs: Character (My Stats, Loadout, Respec, AR Estimator, Progression), Journey, Dashboard, Optimizer, Compare, plus sub-views.

### v3.3 engine expansion scope (completed this session)

Three-tier engine expansion activated data already in ENG_DATA and added curated game knowledge:
- **Tier 1**: Status effects (6 types from enc.sp + boss.rs), spell availability, talisman recommendations
- **Tier 2**: Spell damage model (47 motion values × spell scaling × boss defense/negation → DPS)
- **Tier 3**: Ashes of War (15 curated), weapon buffs (10 entries), poise/stagger model

### Design decisions confirmed by playthrough (DD35–DD40)

| DD | Decision | Status |
|---|---|---|
| DD35 | Golden Seed is universal optimal keepsake | Confirmed |
| DD36 | Crafting Kit + Torch are mandatory first purchases for ALL classes | Confirmed |
| DD37 | Wretch IS universally optimal class (zero stat waste: 10×8=80, every point at minimum) | Confirmed |
| DD38 | Weapon upgrade level dominates stat investment in early game | Confirmed |
| DD39 | Walkthrough steps need power-gate filtering | Confirmed, implemented in v3.3 (F2) |
| DD40 | Single recommendation over comparison tables | Confirmed, implemented in v3.1 |

### v3.x future roadmap

- ~~Enemy resistance awareness in routing (E4)~~ Done v3.6
- ~~Stat point advisor: account for weapon requirement breakpoints (E3)~~ Done v3.4 (initial), expanded v3.9 (+1–5 range, choice eval engine)
- ~~Talisman damage multipliers applied to effective damage calculations~~ Done v3.7
- Spirit ash availability flagging (Mimic Tear = 2x DPS gate)
- ~~Spell availability by walkthrough step~~ Done v3.8
- ~~Stat allocation optimizer~~ Done v3.9 (greedy marginal-value engine, 3 presets)
- ~~Rune cost / levels-from-runes math~~ Done v3.9 (datamined RUNE_COST_TABLE)
- Kill the checklist, build the journey — walkthrough steps become backing data queried by engine, not a scrollable list

### Known limitations

- Upgrade level not tracked per weapon — uses regional cap
- Obtained items not tracked — weapon availability modeled by constraints (DLC weapons gated, base weapons not region-gated)
- Static HTML shell flashes before React hydrates
- Build-aware filtering covers 69 of 214 P3 steps
- Optimizer is endgame-only (does not use progression curve data)
- Spell motion values are community-estimated, not datamined — may have ±15% variance
- AoW damage table is curated (15 of ~100+ AoWs) — covers most impactful, not exhaustive
- Talisman loadout is curated top 4 per archetype — full talisman database not modeled
- ~~Spell availability filtered by stat requirements only~~ Done v3.8 — step-gated via SPELL_STEP

---

## DEVELOPMENT PROTOCOL

**Context constraint:** The HTML file (~1.35 MB) cannot be uploaded to conversations. Use `split_for_claude.js` to split into data block (~900KB, stays local) + code block (~400KB, uploadable). After edits, `merge_from_claude.js` reassembles the complete file. Fallback: `extract_manifest.js` for structural recon (~4KB JSON output).

**Version numbering:** Minor versions 1–99 (v3.1, v3.2, ... v3.99). Version is displayed visually in the tool header as "COMPANION v[X.Y]". Hardcoded in the header string — find and replace on each delivery.

**Line map is memorized.** Do not rediscover structure each session. Reference the file structure table above. Line numbers shift after each delivery — update this document.

**Never load lines 69–2003.** That's inline JSON data — 69% of the file. All code edits target line 2004+.

**Batch edits into single scripts.** Python heredoc for multiple edits, create-then-inject for new functions. Target: 4–6 tool calls per feature.

**One feature per conversation** (flexible when features are interconnected — user may direct multiple items per session).

**Two-entity workflow.** Gunny (command) ↔ Claude Code (operational + technical). Chat removed from loop as of April 3, 2026.

**Verify minimally:**
```bash
echo "LINES: $(wc -l < app.html)" && \
grep -c 'featureIdentifier' app.html && \
sed -n 'START,ENDp' app.html | node --check 2>&1 && \
tail -3 app.html
```

**Update this document after every delivery.** New line count, shifted ranges, what was added, new version number.

**React hooks live in App component only.** Do not add hooks elsewhere. (Compare tab has a pre-existing violation — fix is on the roadmap.)

---

## BACKLOG

### BUGS (broken behavior)
- **B1:** Level calc hardcodes 79 as base stat total. [DONE v3.2 — WRETCH_BASE_TOTAL/WRETCH_LEVEL constants]
- **B2:** Compare tab hooks violation. [DONE v3.2 — rebuilt inside App component. 312 lines → ~160 lines. Hooks-compliant, Wretch-native, uses B7/B9 engine fixes, physical subtype aware.]
- **B3:** Stormfoot Catacombs step requires ranged weapon player may not have. [DONE v3.3 — removed false Kalé Shortbow claim from step 16. Stormfoot (step 74) now notes sprint-past option and points to Coastal Merchant (step 145) for Shortbow (600r).]
- **B4:** renderSettings About section hardcodes "v1.0" and stale data counts. [DONE v3.3 — version to v3.3, removed "8 recommended builds", updated to live ENG_DATA counts, added progression system description.]
- **B5:** Optimizer header shows stale "3,216 weapons" count. [DONE v3.3 — uses dynamic weaponPool/ENG_DATA counts. Removed "10 classes", says "13 archetypes, Wretch-locked (DD37)".]
- **B6:** Header shows "COMPANION" with no version number. [DONE v3.2 — was already implemented. Version bumped to v3.3.]
- **B7:** engDmgVsBoss applied negation/defense in wrong order. [DONE v3.3 — defense curve on raw AR first, then negation]
- **B8:** Boss data single `df` value vs per-type defense. [CLOSED — verified via Fextralife, PureEldenRing, tarnished.dev that Elden Ring bosses use single scalar defense. Per-type differentiation is handled entirely by negation, which we already have correct.]
- **B9:** Engine ignores physical damage subtypes (slash/strike/pierce). [DONE v3.4 — PHYS_SUBTYPE map added, engDmgVsBoss accepts weaponType param, all 11 call sites updated. Strike vs standard: 39-55% damage difference on resistant bosses now computable.]
- **B10:** Colossal weapons unconditionally apply 1.5x STR even when one-handed. [DONE v3.3 — added twoHand guard to engCalcAR line 2050 and meetsRequirements line 2209. Affected: Giant-Crusher and all type 50/51/53/56 weapons.]
- **B11:** `engDecodeW` / `engDecodeWAtLevel` did not scale status buildup (bleed/frost/poison/rot/sleep/madness) with upgrade level. The encoded reinforcement tables have zero `statusSpEffectId1/2/3` offsets across every row, so `Object.assign(a, sp)` always returned the +0 base value. Diagnostic confirmed flat bleed across +0 → +25 for Morning Star, Uchigatana, Flail, Reduvia, Bloodhound's Fang, Great Knife. [DONE v3.10 — added `engStatusUpgradeMult(level, maxLevel)` helper. Standard rt (26 lvl) reaches +45% at max, Somber rt (11 lvl) reaches +50% at max, linear interpolation. Validated against real-game scaling within ~5%. Both decode functions updated. **Side issue noted:** Bandit's Curved Sword has `sp:undefined` in encoded data — separate data fix, deferred.]
- **B12:** **WALKTHROUGH RECONSTRUCTION PROJECT.** Walkthrough has massive content gaps that pre-existed the initial git commit (March 27, 2026). Step IDs 2, 3, 7, 9, 10, 14, 18-25, and many more throughout are missing. Three Claude sessions edited adjacent content without detecting the gaps. Per Gunny: original v2.x project scope was a complete walkthrough — start to finish, every step verified, all 6 endings, every boss, main game, DLC. **Recovery from git/memory is impossible** (gaps existed in initial commit, no memory references). **Fix: full rebuild via external research** from Fextralife + PureEldenRing, applied through the Greyoll-farm lens (Phase 0 forced prologue) and the Palace Approach Ledge-Road farm lens (Phase 3 power-leveling). Decomposed into 23 research phases R1-R23 — see `memory/project_walkthrough_reconstruction.md` for full phase tracking. [IN PROGRESS — Phase 0 region complete as of v3.13, R1-R3 merged into single region. R4+ pending.]
- **B21:** `ENG_DATA.derivedStats.stamina.values` had off-by-one errors at ~15 intermediate END values (END 2/3/6/7/8/11/12/16/19/22/25/28 all +1 too high). Original v3.14 calibration sweep only tested END 10/20/30 which happened to align, missing the intermediate drift. Gunny caught it 2026-04-19 post-commit: at END 12 in-game = 99, engine had 100. Fix: replaced stamina table with Fextralife END 1–99 verbatim. Post-fix: engine = 99 at END 12 (MATCH). [DONE v3.15]
- **B20:** `engDmgVsBoss` and `engSpellDmgVsBoss` compute attack ratio as `AR / Defense`, omitting motion value. Fextralife authoritative formula is `Attack Ratio = (AR × MV) / Defense`. Real attacks have MV 1.0–1.8+ depending on type (R1 ~1.0, R2 ~1.4, charged/jumping ~1.5–1.8). Engine's hits-to-kill output is therefore an **R1-only worst-case floor**, not an expected-play estimate. Empirical check 2026-04-19: Morning Star +3 vs Soldier of Godrick → engine predicted 5/4 hits (1H/2H), Gunny got 3/2 hits. 2H discrepancy implies Gunny used higher-MV attacks (R2/charge/jump). Relative weapon rankings remain correct; absolute hits-to-kill undersells real play by ~30–40%. Fix would require per-weapon-per-attack MV tables from Fextralife (significant data entry). Medium priority — does not block archetype decisions, does block tight kill-time predictions. [BACKLOGGED 2026-04-19]
- **B19:** `ENG_DATA.derivedStats.discovery.values` uses formula `100 + (ARC − 1)` when real in-game formula is `100 + ARC`. 2026-04-19 Fextralife cross-reference + Gunny in-game reads (ARC 10 engine 109 vs in-game 110; ARC 20 engine 119 vs in-game 120) confirm off-by-one. Sub-cell fix: replace discovery table with `{ARC: 100+ARC}` for ARC 1–99. [DONE v3.15]
- **B18:** `ENG_DATA.derivedStats.hp.values` VIG 10 = 415 but real in-game = 414. Fextralife VIG table shows 414; Gunny in-game confirmed 414. Likely minor rounding difference across several VIG values. Fix: replace HP table with Fextralife VIG 1–99 verbatim. [DONE v3.15]
- **B17:** `engDefenseMult` (line 2472-2478) uses LINEAR piecewise interpolation with multipliers that exceed 100% (caps at 120%). Fextralife authoritative formula is piecewise QUADRATIC, caps at 90% (damage landed, not a multiplier bonus). **Impact: engine overestimates melee damage by ~30% at realistic attack ratios.** Every boss damage prediction, hits-to-kill calc, archetype ranking, and "best weapon for boss" output is affected. Fix: replace with Fextralife's piecewise quadratic — breakpoints 0.125/1/2.5/8, coefficients 2.552/7.5/151.25, clamp 10%/90%. Also: engine upper knee is at ratio 7.0; Fextralife's is 8.0. **Most load-bearing engine bug ever found.** [DONE v3.15]
- **B16:** `RUNE_COST_TABLE` values are badly wrong from L13 onward (engine is ~60–70% of real Fextralife cost). L1–L12 match; L13+ diverges with growing gap (engine[100]=48,174 vs Fextralife L99=60,265, Δ −12K per level). v3.9 commit claim of "datamined RUNE_COST_TABLE replaces wrong cubic formula" installed another wrong table. Impact: `levelsFromRunes` overestimates levels bought per rune → Stat Optimizer, farm-target value, and rune budget math all skewed. Fix: replace L1–L125 with Fextralife verbatim values, replace cubic fallback with closed-form `floor((max(0, ((L+81)−92)×0.02) + 0.1) × (L+81)² + 1)` for L126+. [DONE v3.15]
- **B14:** `ENG_DATA.derivedStats.fp.values` lookup table was wrong — curve shape, not a flat offset. 2026-04-19 calibration: engine 68/146/248 at MND 10/25/40 vs in-game 78/147/235 (Δ +10 / +1 / −13). Fix: replaced with Fextralife authoritative MND 1–99 table (includes the unique +13 bump at MND 9). Post-fix verification: engine matches in-game exactly at all 3 tested points (Δ = 0). [DONE v3.15]
- **B15:** `ENG_DATA.derivedStats.equipLoad.values` lookup was biased ~1–2 high; also ramped END 1→8 linearly 24.9→45 when real game holds flat at 45.0 for END 1–8. Fix: replaced with Fextralife authoritative END 1–99 table. Post-fix: engine matches in-game exactly at END 10/20/30 (Δ = 0.00). [DONE v3.15]
- **B13:** `engCalcAR` rounding mismatch with Elden Ring's in-game equipment panel display — **NARROWER THAN ORIGINALLY CLAIMED (v3.14 calibration)**. Original 2026-04-10 diagnosis framed this as a broad systemic bug: "engine overshoots by 1 AR whenever both base and scaling have fractional parts (common case)." v3.14 calibration (12 configurations vs in-game level-up preview, same Morning Star +3) showed the mismatch reproduces ONLY at STR 12 (the weapon's STR requirement threshold), NOT at STR 20/30/40/55 — all of which match engine's floored float exactly. This is a narrow boundary-case bug, not a systemic 1-off error. Exact cause no longer certain (original "floor sum vs floor components" theory doesn't explain why higher STR matches). Possible root cause: engine's `calcCorrectGraph` interpolation at the requirement-threshold has a minor precision discrepancy with the game's internal curve. **Fix priority reduced**: engine is trustworthy for Stat Optimizer purposes at realistic post-commit stat ranges (20+ STR). Walkthrough step 39 still uses Gunny's verified in-game values at 12 STR / 10 DEX (154 / 161). Original "floor components separately" fix no longer proposed. [PLANNED, low-priority. Deeper investigation needed to identify the actual breakpoint.]

### FEATURES (new capability)
- **F1:** Character creation screen. [CLOSED — not needed. Wretch locked (DD37), walkthrough guides first purchases (Step 16), keepsake guidance is implicit. No added value as separate UI.]
- **F2:** Power-gated walkthrough filtering — suppress/flag steps unviable at current power level. [DONE v3.3 — region-level power gate warning banner when player is underpowered vs gating boss]
- **F3:** "Where to go next" — highest-value destination computed from current state and next boss gate. [DONE v3.3 — Next Objective dashboard panel with boss readiness, best weapon recommendation, power budget. getNextMandatoryBoss shared engine function.]
- **F4:** Remove static Fextralife builds. [DONE v3.2 — BUILDS array, renderBuilds, renderClasses deleted. -178 lines. Opinion-based content replaced by engine-computed recommendations in loadout/optimizer.]
- **F5:** Ranged utility system. [DONE v3.2 — AMMO_DATA (30 entries) in engine, arrow/bolt slots in loadout UI, ammo auto-filters by weapon type, live AR = weapon + arrow combined, status effects displayed. Shortbow from Coastal Merchant step 145 (B3 corrected v3.3).]
- **F6:** Dynamic weapon pool. [DONE v3.2 — builds async after first render (~1s). 98 unique weapons, 787 entries (28% of 2,764). 4x globalOptimize speedup (38ms vs 158ms). Same results, no static list to maintain. Header shows pool status indicator.]
- **F7:** Progression curves — per-archetype optimal weapon at each regional checkpoint. [DONE v3.3 — computeProgressionCurve engine + Progression sub-tab in Character. Archetype selector (13 templates), DLC toggle, weapon curve table with status coloring, weapon transition highlighting, expandable per-boss detail (top 3 1H/2H, stats, affinities, upgrade caps), summary footer.]
- **F8:** Post-Greyoll Stat Allocation Optimizer. **Scope:** given the player's *committed* archetype (chosen by them, not ranked by the tool) + current rune budget + current level + current weapon + current talismans → produce the optimal per-stat allocation across the affordable levels through the next mandatory boss (typically Margit). **Wraps `optimizeStats`** with a `runeBudget → targetLevel` conversion (`startLevel + levelsFromRunes(startLevel, R)`). **Survivability constraints:** existing `vigFloorForBoss` + new equip-load awareness (medium roll < 70% load), per-weapon-class END floor (colossals need higher stamina recovery), Soreseal-equipped flag (effective stat baseline +5 STR/DEX/INT/FAI). **UI:** Dashboard panel that activates after the player checks off Greyoll on the journey. **Not in scope:** ranking archetypes against each other — the player's archetype choice is INPUT, the optimization is OUTPUT. [PLANNED — queued post-v3.10 walkthrough rewrite per playtest 2026-04-10.]

### ENHANCEMENTS (improve existing capability)
- **E1:** Step numbers on walkthrough cards. [DONE v3.2 — #stepnumber in upper right of each card, already implemented.]
- **E2:** Version display in header. [DONE v3.2 — "COMPANION v3.3" in header, already implemented.]
- **E3:** Stat advisor accounts for weapon requirement breakpoints. [DONE v3.4 — archetype dropdown on My Stats, breakpoint scan in advisor, progression merged into AR Estimator, import validation hardened]
- **E4:** Enemy resistance awareness in routing. [DONE v3.6 — ENEMY_RESIST data (2 enemy types, 11 tunnel/cave zones), getEnemyResistWarning engine function, walkthrough step card warnings with weapon type detection and strike weapon recommendation]

### FUTURE (not yet scoped)
- Kill the checklist, build the journey — walkthrough steps become backing data queried by engine

---

## COMPLETED DELIVERIES (this session)

- **Session close 2026-04-22:** Phase B-Overlay shipped end-to-end + Merchant pipeline built from scratch. 8 commits (`704623a` → `d01d2f6`).
  - **Phase B-Overlay snapshot** (`704623a`): `scripts/phase_b_overlay_fanapis_snapshot.js` paginates eldenring.fanapis.com across 13 endpoints (added ammos+shields in bite 1). 2,207 rows, ~2.1MB, `data/fanapis/*.json`. Endpoint path gotcha: ashes of war is `/api/ashes`.
  - **New canonicals** (`07e460b`): `data/bosses.json` (105 with 207 item-drop mappings), `data/npcs.json` (55), `data/locations.json` (177). First boss→item acquisition data ever ingested.
  - **Validate** (`1386896`): `scripts/phase_b_overlay_validate.js` + `data/fanapis/drift_report.json`. Canonical confirmed aligned with fanapis across all classes; originally-feared "52+58 armor drift" was canonical-Kaggle vs engine's stale `enginePoise` overlay, not a real arbitration blocker.
  - **Fextralife drift patch** (`abfcfd9`): 11 targeted corrections with per-entry `fextralife:{verifiedAt,sourceUrl}` audit — 5 incantation all-zero-req bugs, 1 armor (Redmane Knight Helm poise 4→8 weight 3.9→5.1), 5 weapon req fills. Law of Causality flagged for in-game verification (Fextralife says int=29, unusual for incantation).
  - **Merchant inventories** (`5bbd0e9`): 8 stationary merchants / 113 items harvested from Fextralife (Kalé, Twin Maiden Husks, Miriel, Corhyn, Sellen, Thops, Bernahl, Patches).
  - **Merchant overlay** (`a4b306f`): `scripts/phase_b_merchant_overlay.js` with 9-entry normalization map → 102/113 matched, 86 canonical items carry merchants[], `data/merchant_reverse_index.json` built.
  - **Canonical gaps closed** (`cc78232`, bite 1): `data/shields.json` (69, first shield catalog), `data/ammos.json` (53). Added Assassin's Approach / Missionary's Cookbook [2] / Sacrificial Twig to canonical. Patches Sacrificial Twig price 5000→3000. Overlay 113/113.
  - **Merchants extended** (`d01d2f6`, bite 2): +6 specialists (Rogier, Gowry, Seluvis, D, Gurranq, Imprisoned Mohgwyn). Schema extended with `specialCost:{amount,currency}` for Deathroot/Starlight Shards. Canonical typo fix: Gurrang → Gurranq's Beast Claw. **Final: 14 merchants / 153 items / 100% attribution / 124 canonical items carry merchants[].**
  - **Canonical counts**: 8 → 14 files (+bosses, npcs, locations, shields, ammos, merchants). 1,757 → 2,219+ rows. 14 scripts added.
  - **Next session pickup**: Nomadic/Isolated merchants (region-scattered) OR chest/world pickups per region OR quest rewards OR Phase C/D (tc_next journey view, unblocks playtest).

- **v3.14 (April 17, 2026):** Phase 0 live-playtest corrections + engine math verification + project-instruction hardening. Gunny played Phase 0 steps 40-42 in real-time; every walkthrough claim and engine number was stress-tested against in-game reality, producing a calibration dataset and four new locked memory rules.
  - **Step 40 rewrites (3 passes)**: Added Third Church of Marika pickups (Sacred Tear, Flask of Wondrous Physick, Crimson Crystal Tear — missed in original Phase 0 scope). Corrected Bestial Sanctum arrival geometry (portal lands right in front of the Sanctum door; no Black Blade Kindred patrol on the approach from the portal; SoG is inside on the right). Corrected Crimson Crystal Tear effect (instant 50% max HP per Fextralife, not "HP over time" as pre-existing s:72 catalog note claimed). Catalog entries s:70-72 tagged as Phase 0 pickups.
  - **Step 41 rewrite**: Complete Bestial Sanctum → Fort Faroth transit path: SE on road, Golden Seed on tree waypoint, Farum Greatbridge SoG (left of bridge), sprint past Flying Dragon Greyll (≠ Elder Dragon Greyoll), Minor Erdtree, spiritspring facing SW, land near Fort Faroth, Fort Faroth SoG at bottom of stairs. Prior "ride to Greyoll" one-line directive replaced with waypoint-by-waypoint navigation verified against Gunny's in-game movement.
  - **Step 42 rewrite**: Greyoll farm mechanics corrected from dismounted 2H → MOUNTED on Torrent (1H R1 from horseback). Operating base corrected from Bestial Sanctum SoG → Fort Faroth SoG. Respawn exploit clarified: sprint back on Torrent, rest at Fort Faroth SoG BEFORE the corpse despawns. **Major engine data correction:** `FARM_TARGETS` Greyoll rune reward 80,000 → **50,000** per kill (Fextralife-verified; 80K figure had conflated the main kill with the 5 lesser dragons at ~17K combined that aren't killed by mounted tail-farming). Recommended kill count revised from 2 → **3** (100K @ L44 → 150K @ L51; kill 3 marginal +7 levels; kill 4 drops to +4 — real stop point).
  - **Step 43 update**: Projection updated to Wretch level ~51, 150K runes, Radagon's Soreseal at Fort Faroth already accessible.
  - **Engine math verification (calibration sweep vs in-game)**: While Gunny held 150K unspent runes, tested engine `engHP`, `engFP`, `engStam`, `engEquip`, and `engCalcAR` against the in-game level-up preview across 12 stat configurations. Results: HP/FP/Stam off by ±1 below soft caps, exact at soft/hard caps (VIG 25/40, END 25 equip load all match); AR matches exactly at STR 20/30/40 when flooring engine float; null scan confirmed INT/FAI contribute zero on Morning Star. Scripts: `scripts/calibrate_vs_ingame.js`, `scripts/calibrate_sweep2.js`. **B13 finding refined**: originally described as "engine overshoots by 1 AR when base and scaling both have fractional parts (common case)". New calibration shows B13 reproduces only at STR 12 (the requirement-threshold boundary for Morning Star) and NOT at STR 20/30/40. B13 is a narrower boundary-case bug than the 2026-04-10 analysis suggested, not a systemic issue. Engine is trustworthy for archetype recommendations.
  - **Archetype × Weapon forecast**: Built `scripts/archetype_forecast.js` to compute optimal allocation per candidate weapon vs Margit at L51. Top 3 acquisition-realistic options: Bloodhound's Fang (AR 357 / 12 hits, STR 17/DEX 24, Darriwil fight), Winged Scythe (AR 300 / 14 hits, STR/DEX/FAI triple, Tombsward Ruins), Lordsworn's GS (AR 270 / 16 hits, Pure STR, already owned). Initial forecast included Halo Scythe and Coded Sword as early-game options — BOTH WRONG. Cross-check against Fextralife exposed: Halo Scythe is a 2% Cleanrot Knight drop at Heart of Aeonia (scarlet rot swamp, not early-game); Coded Sword is in Leyndell Royal Capital (post-Morgott, absolutely not early-game). Errors traced to bad `WEAPON_STEPS` data in engine.
  - **Engine data errors documented (B12 addendum)**: `WEAPON_STEPS["Coded Sword"] = 264` → actually Leyndell. `WEAPON_STEPS["Halo Scythe"] = 264` → actually Heart of Aeonia 2% drop. `WEAPON_STEPS["Cipher Pata"] = 924` → actually Roundtable Hold (pre-Margit accessible). Reduvia and Golden Halberd missing from `WEAPON_STEPS` entirely. Captured in `memory/project_walkthrough_reconstruction.md` with fix plan.
  - **Four new locked memory rules**:
    1. `feedback_verify_game_data.md` extended from numeric-only to ALL game-state claims (drops, locations, acquisition gates, NPC rewards).
    2. `feedback_engine_data_is_suspect.md` (new): `WEAPON_STEPS`, `FARM_TARGETS`, and similar engine data have known B12 errors — always cross-check against Fextralife before recommending.
    3. `feedback_pre_recommendation_checklist.md` (new): 4-gate verification (stat reqs, location, acquisition bosses, current-step reach) before ANY weapon/build recommendation.
    4. `feedback_batch_playtest_commits.md` (new): During live playtest, accumulate edits; commit once at session close, not per-step.
  - **Protocol test (new verify-before-present discipline)**: Ran 4-gate analysis on TheGamer's early-weapons article. Caught 1 false fact (Zweihander DEX 22 claim; actual 11), 3-4 misleading "early-game" framings (Axe of Godrick, Mohgwyn's Sacred Spear, Moonveil, Crystal Sword), and ~12 subjective claims presented as facts. Reddit and RockPaperShotgun were harness-blocked (not analyzed). Script: `scripts/verify_thegamer_claims.js`.
  - Scripts added: `archetype_forecast.js`, `calibrate_vs_ingame.js`, `calibrate_sweep2.js`, `verify_thegamer_claims.js`, `weapon_lookup.js`.

- **v3.2:** DD37 Wretch-only optimization. globalOptimize 10x faster (single class). bestWeaponForBoss: meetsRequirements pre-filter + single-level decode. Derived stat keys pre-computed. All UI locked to Wretch. B1 fixed.
- **v3.3:** engDmgVsBoss defense/negation order corrected (COA 2). 18% error eliminated on high-negation bosses.
- **Curated weapon pool:** 152 weapons from 2,764 (engine cross-referenced with community research). 66 engine-verified for optimizer hot loop.
- **B8 investigation:** Per-type boss defense confirmed as single scalar. Not a real issue. Closed.
- **v3.4:** B9 — physical subtype negation (slash/strike/pierce). PHYS_SUBTYPE map, engDmgVsBoss weaponType param, all 11 call sites updated. 39-55% damage differentiation now visible.
- **v3.2 DELIVERY:** E1 (step numbers on walkthrough cards), E2 (version display "COMPANION v3.2" in header), B3 (Shortbow added to Kalé mandatory purchases, Stormfoot step references it), B4 (About section updated to v3.2 + correct data counts), B5 (optimizer count corrected to 2,764). File renamed to Tarnished_Companion_v3.2.html. Lines: 4,616.

- **v3.3 (April 3, 2026):** Major engine expansion session. 552 lines added.
  - B10: Colossal STR fix. B3: Kalé Shortbow corrected to Coastal Merchant. B4/B5/B6: Version/count display fixes.
  - F2: Power-gated walkthrough banner. F3: Next Objective dashboard panel. F7: Progression curve engine + UI.
  - Boss name alignment across 4 data structures. 11 new BOSS_READY entries.
  - Archetype affinity filtering + DLC weapon gating (58 weapons).
  - Caster catalyst system (staves/seals ranked by spell scaling).
  - **Tier 1**: Status effects (6 types from enc.sp + boss.rs → hits-to-proc, proc damage, integrated into weapon rankings).
  - **Tier 2**: Spell damage model (47 motion values × scaling × defense/negation → DPS ranking per boss).
  - **Tier 3**: Ashes of War (15 curated), weapon buffs (10 entries), poise/stagger model.
  - Talisman recommender (top 4 per archetype from 41 entries).
  - Spell availability by stat requirements + walkthrough step acquisition (v3.8).
  - Lines: 4,460 → 5,012.

- **v3.10 (April 10, 2026):** B11 status scaling fix + Wretch beeline walkthrough rewrite (Phase 0 forced prologue).
  - **B11 engine fix**: `engDecodeW` / `engDecodeWAtLevel` now scale status buildup with upgrade level via new `engStatusUpgradeMult(level, maxLevel)` helper. Standard rt (26 lvl) reaches +45% at max; Somber rt (11 lvl) reaches +50% at max; linear interpolation. Validated within ~5% of real-game values for Morning Star, Uchigatana, Flail, Reduvia, Bloodhound's Fang, Great Knife. Diagnostic scripts: `scripts/diag_bleed_scaling.js`, `scripts/calc_morning_star_greyoll.js`. **Side issue noted:** Bandit's Curved Sword has missing `sp` field in encoded data — separate fix deferred.
  - **Wretch beeline walkthrough rewrite**: Repurposed step 35 (was Flail) as the Phase 0 strategy directive. Inserted step 372 (Morning Star pickup at wrecked carriage) and step 373 (Smithing Stone Farm + upgrade directive) in Weeping Peninsula region. Modified steps 73 (Bestial Sanctum portal — added prerequisite chain), 117 (Limgrave Tunnels — deposits-only Phase 0 use), 118 (Stonedigger Troll — post-commit deferral), 374 (Castle Morne Rampart — post-commit), 410 (Morne Tunnel — deposits-only), 411 (Scaly Misbegotten — post-commit), 1264 (Greyoll — full rewrite with bleed strategy + Torrent reset exploit). Fixed `WEAPON_STEPS["Morning Star"]: 371 → 372`.
  - **Strategic frame**: The Cave of Knowledge → Greyoll loop is now formalized as the universal **Phase 0 forced prologue** for every archetype. Player makes the archetype commitment AFTER 2 Greyoll kills (level 1 → ~52, +51 levels of stat budget) with full information. The "real game" begins at Fort Faroth post-commit. This is an optimal-stopping problem under resource constraints: defer commitment to maximize information.
  - **Combat capability ceiling rule** (memory): Wretch + Morning Star +0–6 can engage strike-vulnerable mob enemies and Greyoll-from-behind only. Cannot engage Stonedigger Troll, Scaly Misbegotten, Fort Faroth rats, Black Blade Kindred. Every Phase 0 step must pass this test.
  - **Calculation results**: Morning Star Greyoll math (engine output post-B11): +0=119 hits, +4=112 hits (first knee), +6=112 hits (Stone 2 cap, +5% physical chip), +8=105 hits (requires Stone 3 — not pre-Greyoll). Two Greyoll kills = level 41 → 52 (+51 total). Third kill yields only +7 levels — diminishing returns confirmed.
  - **F8 queued**: Post-Greyoll Stat Allocation Optimizer. Scope: input archetype, output optimal allocation. Not a ranking view.
  - Lines: 5,846 → 5,866.

- **v3.9 (April 2026):** Stat allocation optimizer + choice evaluation engine + rune cost correction + early walkthrough fixes.
  - **Choice evaluation engine** (commit e1959e5): `evaluateChoices`, `rankActions`, `computeStatCostToEquip`, `computeWeaponValue`. Dashboard "Recommended Actions" panel. Level-Up Advisor breakpoint scan expanded to +1–5 range. `detectBuildArchetype` removed (charData.archetype now explicitly set). New data: `WEAPON_STEPS` (30 weapons), `FARM_TARGETS` (4 sources), `runeCostForLevel`/`levelsFromRunes` rune utilities.
  - **Stale version strings fix** (commit a787133): title, header, About all aligned to v3.9.
  - **Baseline file rename** (commit e90065e): `Tarnished_Companion_v3.9.html`.
  - **Early walkthrough fixes + Greyoll path optimization + rune cost correction** (commit 6fc45c1): Map: Limgrave West (33), Map: Limgrave East (46), Lordsworn's Greatsword (34), Flail (35) at Gatefront, Crimson Crystal Tear (72), Bestial Sanctum portal (73). Removed redundant Kalé step 39. Boc description fix. Larval Tear (60) and Darriwil (62) level warnings. Whetstone Knife typo. Ranni/Spirit Bell renumber. STEP_CLASS/STEP_ITEMS updated. FARM_TARGETS Greyoll: step 1264 → 73. WEAPON_STEPS: Flail 35, Lordsworn's Greatsword 34. `runeCostForLevel`: replaced wrong cubic formula with datamined `RUNE_COST_TABLE` — old produced ~40% of actual costs; 80K runes now correctly = 38 levels (was 100).
  - **Stat allocation optimizer** (commit 7bc7c58): `optimizeStats` greedy coordinate-ascent allocator. Scoring combines weapon damage, status DPS, spell DPS, log(HP) survivability, log(stamina/FP) sustainability. Three presets (Aggressive / Balanced / Tanky). `vigFloorForBoss` survivability floor scales with boss level. Auto-tests top 3 weapon candidates per archetype. Stat Optimizer panel in Character tab — 8-stat grid, projected damage/HP/hits-to-kill, preset toggle, delta from current. ~320 evaluations × 0.025ms ≈ 8ms per optimization.
  - Lines: 5,325 → 5,846 (+521).

- **v3.8 (April 6, 2026):** Spell availability by step + caster hand placement loadouts.
  - `SPELL_STEP`: 47 spells mapped to earliest walkthrough acquisition step (NPC vendor, scroll, quest reward).
  - `CASTER_LOADOUT`: 9 caster archetypes × {RH melee, LH catalyst, tactical notes} for hand placement guidance.
  - `availableSpells(stats, type, step)`: Now accepts optional `step` param — filters out spells not yet obtainable at that progression point.
  - Integration: `computeProgressionCurve` passes `boss.step` to `availableSpells`, adds `casterLoadout` to curve output.
  - Lines: 5,249 → 5,325.

- **v3.7 (April 6, 2026):** Talisman damage integration — optimal loadouts applied to progression engine.
  - `TALISMAN_LOADOUT`: 13 archetypes × 4 talismans each, with step numbers, locations, damage multipliers, and stat bonuses.
  - `computeTalismanBonus(templateId)`: Returns {statBonus, meleeMult, spellMult} for an archetype's optimal loadout.
  - Integration: stat bonuses applied before AR calc in `computeProgressionCurve`, melee multiplier applied to weapon damage results, spell multiplier applied to spell DPS results.
  - DLC assessment: Blade of Mercy (+6%/hit conditional) does not displace any base game top 4. Base game loadouts are universally optimal.
  - Lines: 5,128 → 5,249.

- **v3.6 (April 6, 2026):** E4 — enemy resistance warnings at farming/progression chokepoints.
  - ENEMY_RESIST data: 2 enemy types (miners, crystalians) across 11 tunnel/cave zones with step ranges.
  - `getEnemyResistWarning(step, charState)`: Detects if player's equipped weapon damage subtype is resisted, finds best available strike weapon via meetsRequirements + engCalcAR.
  - Walkthrough UI: contextual warning card on step cards within resist zones. Shows enemy type, resisted subtypes, player weapon mismatch (if any), and strike weapon recommendation.
  - Lines: 5,063 → 5,128.

- **v3.5 (April 6, 2026):** TD-01–05 — tech debt cleanup. -9 lines.
  - TD-01: Extracted `engDefenseMult(ratio)` from duplicated defense curve in engDmgVsBoss + engSpellDmgVsBoss.
  - TD-02: Extracted `filterArchPool(weapons,affPref,priStats,excludeDLC)` from duplicated pool filtering in computeProgressionCurve.
  - TD-03: `isBuildRelevant` normalized to STAT_TEMPLATES lookup only (dropped hardcoded archetype name map).
  - TD-04: `detectBuildArchetype` rewritten to score against STAT_TEMPLATES targets, returns template ID instead of ad-hoc names.
  - TD-05: Removed unused `isDLC` parameter from `bestAshOfWar` signature and call site.
  - Lines: 5,072 → 5,063.

- **v3.4 (April 4, 2026):** E3 — stat advisor breakpoints + archetype system + import hardening.
  - Archetype dropdown on My Stats (13 STAT_TEMPLATES + Undecided), persisted to charData.archetype.
  - Progression tab removed; weapon curve table merged into AR Estimator.
  - Next Level-Up Advisor expanded: tests all 8 stats (was 5), breakpoint scan filters archetype weapons via meetsRequirements, shows unlock callouts.
  - Import validation: weapon names checked against ENG_WEAPON_NAMES, ammo against AMMO_DATA, object field types enforced.
  - Ammo slots normalized to {name} objects (was raw strings), consistent with weapon slot structure.
  - isBuildRelevant expanded to accept template IDs via STAT_TEMPLATES lookup.
  - Journey tab reads charData.archetype with detectBuildArchetype inference fallback.
  - Lines: 5,012 → 5,072.

---

*Single project document | March 28, 2026 | Updated April 20, 2026 (v3.9)*
*Replaces: v2_0_baseline.md, v2_0_design_spec.md, dev_operations_guide.md*
