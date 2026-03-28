# Tarnished's Companion — Project Document
## March 27, 2026

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
| Bosses (full resistance profiles) | 173 | `ENG_DATA.bosses` |
| Mandatory boss roster | 13 base + 5 DLC | `MANDATORY_BOSSES` |
| Armor sets | 18 | `ENG_DATA.armor` |
| Walkthrough steps | 1,679 classified | `STEP_CLASS` |
| Step classifications | M 7.4%, P 25.9%, T 0.3%, N 8.5%, C 57.9% | Static tags, promotion computed at render |
| Build-specific P3 tags | 69 | `STEP_ITEMS` |
| Stat templates | 13 archetypes | `STAT_TEMPLATES` |
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
| `engDecodeW(enc)` | 2008 | Decode weapon (all 26 upgrade levels) |
| `engDecodeWAtLevel(enc, level)` | 2025 | Decode weapon (single level — optimizer use) |
| `engCalcAR(weapon, attrs, upg, 2h)` | 2042 | Compute attack rating (validated 29/29) |
| `engDmgVsBoss(arResult, boss)` | 2367 | AR through boss resistance profile → effective damage |
| `resolveStats(cls, tmpl, lvl)` | 2155 | Class + archetype + level → effective stats |
| `meetsRequirements(wEnc, stats, 2h)` | 2201 | Pre-decode stat requirement filter |
| `globalOptimize(targetLevel, includeDLC, options)` | 2216 | Exhaustive class × template × weapon search → top 10 |
| `bestWeaponForBoss(boss, stats, gate, region, 2h)` | 2335 | Top 10 weapons for a single boss given player state |
| `getPlayerBossDmg(bossName, charState)` | 2179 | Single-weapon damage against a specific boss |
| `deriveGateState(ci)` | 2765 | Journey checkoffs → unlocked affinities + upgrade caps |
| `resolveTacticalNeeds(bossName, ci)` | 2836 | Boss + checkoffs → tactical mitigation options |
| `detectBuildArchetype(stats)` | 2856 | Derive archetype from player stats |
| `endingAvailability(ci, qp)` | 3030 | Checkoffs + quest progress → ending status |
| `engHP/engFP/engStam/engEquip` | 2361–2364 | Derived stat curves |

---

## FILE STRUCTURE

**File:** `Tarnished_Companion_v3.1.html` | **Lines:** 4,604 | **Size:** ~1.35 MB

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline data (DO NOT LOAD)** | **69–2003** | Regions, ENG_DATA, ENG_GRAPHS (~69% of file) |
| Engine functions | 2004–2366 | engDecodeW, engCalcAR, resolveStats, globalOptimize, bestWeaponForBoss, derived stat curves |
| engDmgVsBoss | 2367–2387 | AR through boss resistance profile |
| **renderCompare (HOOKS VIOLATION)** | **2393–2705** | ~312 lines, standalone. Own useState, calcBuild, calcArmorFromSet, buildPanel, comparisonRow, boss matchup. Orphaned from main UI block. |
| Character system data | 2707–2763 | REGION_CAPS, BOSS_READY (17 bosses), GATE_WHETSTONES (6), GATE_BELL_BEARINGS (9) |
| Gate + archetype functions | 2765–2857 | deriveGateState, resolveTacticalNeeds, detectBuildArchetype, isBuildRelevant |
| Step classification data | 2853–2855 | STEP_CLASS (1,679 entries), CLASS_LABELS, STEP_ITEMS (69 tags) |
| Class/stat constants | 2858–2877 | CLASS_COLORS, CLASSES (from ENG_DATA), STAT_NAMES/LABELS/DESC, SOFT_CAPS |
| Stat calc wrappers | 2880–2897 | calcHP/FP/Stam/Equip (wrap engine), SCALE_MULT, calcScaleAR |
| **BUILDS (static — replace with F4)** | **2899–2924** | 8 hardcoded Fextralife builds, not engine-computed |
| App core | 2926–2953 | STORAGE_KEY, storage{}, color palette C{} |
| Achievements + Endings | 2954–3113 | 42 achievements, 6 endings, ENDING_DATA, endingAvailability() |
| Categories | 3115–3141 | CATEGORIES array (collectible tracking) |
| Quests + Boss lists | 3142–3222 | 28 quests, BOSSES_BASE (31), BOSSES_DLC (14) |
| UI constants + helpers | 3224–3232 | DASH_CATS, tier/prio colors, catClass, stepClass, h(), btnS() |
| UI primitives | 3234–3238 | ProgressRing, ProgressBar, Chk |
| **App component** | **3241–4604** | 24 useState hooks. State helpers, save/load, export/import. |
| renderCharacter (+ nested) | 3334–4232 | Contains renderBuilds (3454), renderLoadout (3488) |
| renderDashboard | 4233–4293 | |
| renderAchievements | 4294–4343 | |
| renderQuests / Collectibles | 4344–4347 | |
| **renderSettings (stale version)** | **4348–4349** | Hardcodes "v1.0" and wrong data counts — BUG |
| Main render + tab routing | 4350–4564 | renderOptimizer (4353), runOptimizer (4356), TABS, renderers |
| Mount + close | 4606–4608 | ReactDOM.render |

---

## IMPLEMENTATION STATE

### What's built and working (v3.1 — current baseline)

**File:** `Tarnished_Companion_v3.1.html` | **Lines:** 4,604

Everything from v2.0 plus:

**Weapon Analysis Panel** (renderLoadout): Computes AR for equipped weapons across all affinities in ENG_DATA. Shows single recommendation (best weapon + affinity + upgrade level). Current vs Optimal side-by-side. Hits-to-kill against next boss gate. Collapsible detail for alternatives. Flags locked affinities with instructions to obtain whetstone. Tactical needs displayed below.

**Next Level-Up Advisor** (renderLoadout): Computes value of +1 in each stat against equipped weapon and next boss. Recommends VIG until 20, then highest damage stat. Per-stat breakdown: AR gain, damage gain, HP gain, stamina gain.

**Affinity search fix:** Searches all affinities that exist for a weapon in ENG_DATA, not just unlocked ones. Flags locked affinities. Fixes empty results for weapons like Lordsworn's Greatsword that have no Standard (affinity 0) entry.

**Core engine (from v2.0):** AR calculation validated 29/29. Piecewise defense model. Derived stat curves. Class optimizer. `bestWeaponForBoss`, `globalOptimize`, `engCalcAR`, `engDmgVsBoss`.

**Walkthrough system:** 1,679 steps classified. Focused mode (M/P/T only). Build-aware dimming for 69 P3 items.

**Progression gates:** 6 whetstones → affinity unlocks. 9 bell bearings → upgrade caps. Gate state derived from journey checkoffs.

**Boss readiness:** 16 bosses with thresholds. Equipped weapon → AR → boss defenses → hits-to-kill → badge.

**Tactical needs:** 10 entries across 13 bosses. Multi-provider resolution.

**Endings:** 6 endings with lockout detection. Frenzied Flame override, Seluvis Potion lockout, Seedbed Curse math, Law of Regression gate.

**Save system:** Versioned JSON export/import.

**UI:** 18+ React components. Tabs: Character, Journey, Dashboard, Optimizer, Compare, plus sub-views.

### Design Decisions (locked)

| DD | Decision | Status |
|---|---|---|
| DD22 | Cookbooks not gates | Locked |
| DD34 | No claims without computation | Locked |
| DD35 | Golden Seed is universal optimal keepsake | Confirmed, locked |
| DD36 | Crafting Kit + Torch mandatory first purchases ALL classes | Confirmed, locked |
| DD37 | Wretch IS universally optimal class (zero stat waste: 10×8=80) | Confirmed, locked |
| DD38 | Weapon upgrade level dominates stat investment early game | Confirmed, locked |
| DD39 | Walkthrough steps need power-gate filtering | Confirmed, not yet implemented |
| DD40 | Single recommendation over comparison tables | Confirmed, implemented in v3.1 |

### Known Limitations

- Upgrade level not tracked per weapon — uses regional cap
- Obtained items not tracked — weapon availability modeled by constraints
- Static HTML shell flashes before React hydrates
- Build-aware filtering covers 69 of 214 P3 steps
- Optimizer is endgame-only
- Compare tab broken (hooks violation in renderCompare — pre-existing)

---

## BACKLOG

### BUGS (broken behavior)
- **B1:** Level calc hardcodes 79 as base stat total. [DONE v3.2 — WRETCH_BASE_TOTAL/WRETCH_LEVEL constants]
- **B2:** Compare tab hooks violation — renderCompare calls useState outside App component. [OPEN]
- **B3:** Stormfoot Catacombs step requires ranged weapon player may not have. [OPEN]
- **B4:** renderSettings About section hardcodes "v1.0" and stale data counts. [OPEN]
- **B5:** Optimizer header shows stale "3,216 weapons" count. [OPEN]
- **B6:** Header shows "COMPANION" with no version number. [OPEN]
- **B7:** engDmgVsBoss applied negation/defense in wrong order (negation first, defense second). Correct order: defense curve on raw AR, then negation percentage. [DONE v3.3]
- **B8:** Boss data stores single `df` value — real game has per-damage-type defense (phys/magic/fire/lightning/holy). Requires data sourcing. [OPEN — COA 3]
- **B9:** Engine ignores physical damage subtypes (slash/strike/pierce). Weapon type determines subtype but engDmgVsBoss treats all physical as "standard" negation. [OPEN — COA 1]

### FEATURES (new capability)
- **F1:** Character creation screen — class optimizer per archetype, keepsake rec, first purchases. [PLANNED]
- **F2:** Power-gated walkthrough filtering — suppress/flag steps unviable at current power level. [PLANNED]
- **F3:** "Where to go next" — highest-value destination computed from current state and next boss gate. [PLANNED]
- **F4:** Replace renderBuilds with archetype-computed recommendations. [PLANNED]

### ENHANCEMENTS (improve existing capability)
- **E1:** Step numbers on walkthrough cards — display #stepnumber for reference. [PLANNED]
- **E2:** Version display in header — "COMPANION v[X.Y]" in tool header. [PLANNED]
- **E3:** Stat advisor accounts for weapon requirement breakpoints (e.g., "1 STR unlocks two-handing LGS"). [PLANNED]
- **E4:** Enemy resistance awareness in routing (e.g., miners resist slash, bring Club). [PLANNED]

### FUTURE (not yet scoped)
- Kill the checklist, build the journey — walkthrough steps become backing data queried by engine, not a scrollable list

---

## DEVELOPMENT PROTOCOL

**Version numbering:** Minor versions 1–99 (v3.1, v3.2, ... v3.99). Version displayed in tool header as "COMPANION v[X.Y]". Hardcoded string — find and replace on each delivery. Major version at defined milestone.

**Context constraint:** The HTML file (~1.35 MB) cannot be loaded in full. Lines 69–2003 are inline JSON data (~69% of file). All code edits target line 2004+. Use targeted reads only.

**Line numbers shift after every edit.** Reference the file structure table above. Re-verify with grep when needed. Update this document after every delivery with new line count and shifted ranges.

**React hooks live in App component only.** Compare tab has a pre-existing violation — do not add more.

**Update this document after every delivery.** New line count, shifted ranges, what was added, new version number, backlog status.

---

*Single project document | March 27, 2026*
*Replaces: v2_0_baseline.md, v2_0_design_spec.md, dev_operations_guide.md*
