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

**Single-file offline architecture.** One HTML file, React UI, localStorage persistence, no server dependency.

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

---

## ENGINE FUNCTIONS

| Function | Line | Purpose |
|---|---|---|
| `engDecodeW(enc)` | 2013 | Decode weapon (all 26 upgrade levels) |
| `engDecodeWAtLevel(enc, level)` | 2030 | Decode weapon (single level — optimizer use) |
| `engCalcAR(weapon, attrs, upg, 2h)` | 2047 | Compute attack rating (validated 29/29). Computes damage types 0-4 + status 5-10. |
| `engDefenseMult(ratio)` | 2421 | Shared piecewise defense multiplier curve (TD-01). |
| `engDmgVsBoss(arResult, boss, weaponType)` | 2429 | AR through boss defense curve + negation. Physical subtype aware. |
| `engSpellDmgVsBoss(spellScaling, spell, boss)` | 2476 | Spell damage through boss defense + element negation. Uses SPELL_DMG motion values. |
| `engStatusVsBoss(arResult, boss)` | 2575 | Status buildup → hits to proc, proc damage. 6 types: poison/rot/bleed/frost/sleep/madness. |
| `resolveStats(cls, tmpl, lvl)` | 2162 | Class + archetype + level → effective stats |
| `meetsRequirements(wEnc, stats, 2h)` | 2208 | Pre-decode stat requirement filter |
| `globalOptimize(lvl, bosses, tmpls, opts)` | 2224 | Exhaustive class × template × weapon search → top 10 |
| `bestWeaponForBoss(boss, stats, gate, region, 2h)` | 2346 | Top 10 weapons ranked by effective damage (melee + status DPS) |
| `bestCatalystAtCheckpoint(stats, gate, region, type, isDLC)` | 2768 | Top 5 staves/seals ranked by spell scaling |
| `getPlayerBossDmg(bossName, charState)` | 2186 | Single-weapon damage against a specific boss |
| `deriveGateState(ci, atStep)` | 2727 | Journey checkoffs → unlocked affinities + upgrade caps. Optional atStep for ideal-path. |
| `getNextMandatoryBoss(ci, includeDLC)` | 2735 | Next undefeated mandatory boss from journey checkoffs |
| `filterArchPool(weapons, affPref, priStats, excludeDLC)` | 2785 | Shared archetype weapon pool filter (TD-02) |
| `computeProgressionCurve(template, includeDLC, weaponList)` | 2797 | Per-archetype weapon/spell/catalyst progression through all mandatory bosses |
| `availableSpells(stats, type, step)` | 2668 | Filter spells by stat requirements + walkthrough step acquisition (SPELL_STEP) |
| `bestTalismans(template)` | 2603 | Top 4 talismans per archetype from 41 entries (legacy, fallback) |
| `computeTalismanBonus(templateId)` | 2717 | Optimal loadout → {statBonus, meleeMult, spellMult} applied in progression |
| `bestAshOfWar(template, step)` | 2513 | Top AoW recommendations per archetype and step |
| `availableBuffs(template, stats, step)` | 2542 | Weapon buffs available at given stats/step |
| `getBossPoiseInfo(boss)` | 2562 | Boss poise threshold and stagger difficulty |
| `resolveTacticalNeeds(bossName, ci)` | 2917 | Boss + checkoffs → tactical mitigation options |
| `getEnemyResistWarning(step, charState)` | 2940 | Step + equipped weapon → enemy resist warnings with strike weapon rec (E4) |
| `detectBuildArchetype(stats)` | 2938 | Score player stats against STAT_TEMPLATES → best-fit template ID (TD-04) |
| `endingAvailability(ci, qp)` | ~3400 | Checkoffs + quest progress → ending status |
| `engHP/engFP/engStam/engEquip` | 2371–2374 | Derived stat curves |

---

## FILE STRUCTURE

**File:** `Tarnished_Companion_v3.2.html` | **Lines:** 5,325 | **Size:** ~1.5 MB

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline data (DO NOT LOAD)** | **69–2003** | Regions, ENG_DATA (weapons, bosses, sorceries, incantations, talismans), ENG_GRAPHS |
| Engine constants | 2004–2011 | evalCCGraph, ENG_GRAPHS, WRETCH/WRETCH_BASE_TOTAL/WRETCH_LEVEL |
| Core engine functions | 2013–2418 | engDecodeW, engCalcAR, resolveStats, globalOptimize, bestWeaponForBoss (now with status DPS) |
| Derived stat lookups | 2371–2380 | _dsKeys, _dsLookup, engHP/FP/Stam/Equip |
| Physical subtype + ammo data | 2383–2415 | PHYS_SUBTYPE map, AMMO_DATA (30 entries), AMMO_FOR_WEAPON |
| engDefenseMult + engDmgVsBoss | 2421–2443 | Shared defense curve (TD-01), physical subtype aware |
| **Spell damage system** | **2446–2490** | SPELL_DMG (47 motion values), engSpellDmgVsBoss |
| **Ashes of War** | **2494–2525** | ASHES_OF_WAR (15 curated), bestAshOfWar |
| **Weapon buffs** | **2528–2547** | WEAPON_BUFFS (10 entries), availableBuffs |
| **Poise/stagger** | **2551–2567** | STAGGER_TIER, STAGGER_LABELS, getBossPoiseInfo |
| **Status effect system** | **2570–2592** | STATUS_TYPES, STATUS_PROC_DAMAGE, engStatusVsBoss |
| **Spell system** | **2594–2676** | SPELL_STEP (47 spells → acquisition step), CASTER_LOADOUT (9 archetypes × RH/LH), availableSpells (stat+step gated) |
| **Talisman loadouts + engine** | **2628–2735** | TALISMAN_LOADOUT (13 archetypes × 4), computeTalismanBonus |
| Character system data | 2745–2810 | REGION_CAPS, BOSS_READY (27 entries), GATE_WHETSTONES (6), GATE_BELL_BEARINGS (9) |
| Gate + progression functions | 2836–2990 | deriveGateState, getNextMandatoryBoss, DLC_WEAPONS, filterArchPool (TD-02), bestCatalystAtCheckpoint, computeProgressionCurve (talisman-integrated) |
| Tactical needs + archetype | 2992–3105 | TACTICAL_NEEDS, resolveTacticalNeeds, ENEMY_RESIST (E4), getEnemyResistWarning, detectBuildArchetype (TD-04), isBuildRelevant (TD-03) |
| Step classification data | ~3110 | STEP_CLASS, CLASS_LABELS, STEP_ITEMS |
| Class/stat constants | ~3115–3135 | CLASSES, STAT_NAMES/LABELS/DESC, SOFT_CAPS |
| App core | ~3255–3305 | STORAGE_KEY, storage{}, color palette C{} |
| Achievements + Endings | ~3305–3555 | 42 achievements, 6 endings, ENDING_DATA, endingAvailability() |
| UI constants + helpers | ~3575–3615 | DASH_CATS, h(), btnS(), ProgressRing, ProgressBar |
| **App component** | **3470–5247** | 24 useState hooks (progTmpl removed v3.4). charData.archetype added. |
| renderCharacter (+ nested) | ~3639–4480 | renderProfile (archetype dropdown), renderLoadout (E3 breakpoints), renderRespec, renderAR (weapon curve merged from Progression) |
| renderWalkthrough | ~4482–4684 | Step cards, power gate banner (F2), enemy resist warnings (E4), boss readiness inline, charData.archetype with inference fallback |
| renderDashboard | ~4686–4843 | Next Objective panel (F3), walkthrough progress, endings |
| renderSettings | ~4845 | v3.3, live data counts |
| renderCompare | ~4848–4991 | B2 fix, hooks-compliant |
| renderOptimizer | ~4993–5137 | Dynamic weapon count, 13 archetypes |
| Main render + tab routing | ~5137–5247 | TABS, renderers |
| Mount | 5247 | ReactDOM.render |
| Close | 5248–5249 | |

---

## IMPLEMENTATION STATE

### What's built and working (v3.8 — current baseline)

**File:** `Tarnished_Companion_v3.2.html` | **Lines:** 5,325

Everything from v2.0 plus:

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
- Stat point advisor: account for weapon requirement breakpoints (E3 — e.g., "1 STR unlocks two-handing LGS")
- ~~Talisman damage multipliers applied to effective damage calculations~~ Done v3.7
- Spirit ash availability flagging (Mimic Tear = 2x DPS gate)
- ~~Spell availability by walkthrough step~~ Done v3.8
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

### FEATURES (new capability)
- **F1:** Character creation screen. [CLOSED — not needed. Wretch locked (DD37), walkthrough guides first purchases (Step 16), keepsake guidance is implicit. No added value as separate UI.]
- **F2:** Power-gated walkthrough filtering — suppress/flag steps unviable at current power level. [DONE v3.3 — region-level power gate warning banner when player is underpowered vs gating boss]
- **F3:** "Where to go next" — highest-value destination computed from current state and next boss gate. [DONE v3.3 — Next Objective dashboard panel with boss readiness, best weapon recommendation, power budget. getNextMandatoryBoss shared engine function.]
- **F4:** Remove static Fextralife builds. [DONE v3.2 — BUILDS array, renderBuilds, renderClasses deleted. -178 lines. Opinion-based content replaced by engine-computed recommendations in loadout/optimizer.]
- **F5:** Ranged utility system. [DONE v3.2 — AMMO_DATA (30 entries) in engine, arrow/bolt slots in loadout UI, ammo auto-filters by weapon type, live AR = weapon + arrow combined, status effects displayed. Shortbow from Coastal Merchant step 145 (B3 corrected v3.3).]
- **F6:** Dynamic weapon pool. [DONE v3.2 — builds async after first render (~1s). 98 unique weapons, 787 entries (28% of 2,764). 4x globalOptimize speedup (38ms vs 158ms). Same results, no static list to maintain. Header shows pool status indicator.]
- **F7:** Progression curves — per-archetype optimal weapon at each regional checkpoint. [DONE v3.3 — computeProgressionCurve engine + Progression sub-tab in Character. Archetype selector (13 templates), DLC toggle, weapon curve table with status coloring, weapon transition highlighting, expandable per-boss detail (top 3 1H/2H, stats, affinities, upgrade caps), summary footer.]

### ENHANCEMENTS (improve existing capability)
- **E1:** Step numbers on walkthrough cards. [DONE v3.2 — #stepnumber in upper right of each card, already implemented.]
- **E2:** Version display in header. [DONE v3.2 — "COMPANION v3.3" in header, already implemented.]
- **E3:** Stat advisor accounts for weapon requirement breakpoints. [DONE v3.4 — archetype dropdown on My Stats, breakpoint scan in advisor, progression merged into AR Estimator, import validation hardened]
- **E4:** Enemy resistance awareness in routing. [DONE v3.6 — ENEMY_RESIST data (2 enemy types, 11 tunnel/cave zones), getEnemyResistWarning engine function, walkthrough step card warnings with weapon type detection and strike weapon recommendation]

### FUTURE (not yet scoped)
- Kill the checklist, build the journey — walkthrough steps become backing data queried by engine

---

## COMPLETED DELIVERIES (this session)

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

*Single project document | March 28, 2026 | Updated April 6, 2026 (v3.8)*
*Replaces: v2_0_baseline.md, v2_0_design_spec.md, dev_operations_guide.md*
