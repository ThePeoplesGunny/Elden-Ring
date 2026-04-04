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
| Bosses (full resistance profiles) | 173 | `ENG_DATA.bosses` |
| Mandatory boss roster | 13 base + 5 DLC (with region, step, level) | `MANDATORY_BOSSES` |
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
| `globalOptimize(lvl, bosses, tmpls, opts)` | 2216 | Exhaustive class × template × weapon search → top 10 |
| `bestWeaponForBoss(boss, stats, gate, region, 2h)` | 2335 | Top 10 weapons for a single boss given player state |
| `getPlayerBossDmg(bossName, charState)` | 2179 | Single-weapon damage against a specific boss |
| `deriveGateState(ci, atStep)` | 2530 | Journey checkoffs → unlocked affinities + upgrade caps. Optional atStep for ideal-path gate state at any step. |
| `getNextMandatoryBoss(ci, includeDLC)` | 2546 | Next undefeated mandatory boss from journey checkoffs |
| `computeProgressionCurve(template, includeDLC, weaponList)` | 2560 | Per-archetype weapon progression through all mandatory bosses |
| `resolveTacticalNeeds(bossName, ci)` | 2600 | Boss + checkoffs → tactical mitigation options |
| `detectBuildArchetype(stats)` | 2620 | Derive archetype from player stats |
| `endingAvailability(ci, qp)` | 3030 | Checkoffs + quest progress → ending status |
| `engHP/engFP/engStam/engEquip` | 2361–2364 | Derived stat curves |

---

## FILE STRUCTURE

**File:** `Tarnished_Companion_v3.2.html` | **Lines:** 4,672 | **Size:** ~1.4 MB

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline data (DO NOT LOAD)** | **69–2003** | Regions, ENG_DATA, ENG_GRAPHS (~69% of file) |
| Engine constants | 2004–2011 | evalCCGraph, ENG_GRAPHS, WRETCH/WRETCH_BASE_TOTAL/WRETCH_LEVEL |
| Engine functions | 2013–2365 | engDecodeW, engCalcAR, resolveStats, globalOptimize, bestWeaponForBoss |
| Derived stat lookups | 2367–2377 | Pre-computed keys (_dsKeys), _dsLookup, engHP/FP/Stam/Equip |
| Physical subtype + ammo data | 2380–2408 | PHYS_SUBTYPE map, AMMO_DATA (30 entries), AMMO_FOR_WEAPON |
| engDmgVsBoss | 2412–2438 | Defense → negation, physical subtype aware |
| **renderCompare (HOOKS VIOLATION)** | **2441–2744** | Standalone, own useState. Wretch-locked. |
| Character system data | 2746–2802 | REGION_CAPS, BOSS_READY (17), GATE_WHETSTONES (6), GATE_BELL_BEARINGS (9) |
| Gate + progression functions | 2497–2600 | deriveGateState (atStep), getNextMandatoryBoss, computeProgressionCurve |
| Tactical needs + archetype | 2600–2660 | resolveTacticalNeeds, detectBuildArchetype, isBuildRelevant |
| Step classification data | 2892–2894 | STEP_CLASS, CLASS_LABELS, STEP_ITEMS |
| Class/stat constants | 2897–2916 | CLASSES (from ENG_DATA), STAT_NAMES/LABELS/DESC, SOFT_CAPS |
| Stat calc wrappers | 2919–2936 | calcHP/FP/Stam/Equip, SCALE_MULT, calcScaleAR |
| **BUILDS (static — replace with F4)** | **2938–2963** | 8 hardcoded builds, Wretch-based |
| App core | 2965–2993 | STORAGE_KEY, storage{}, color palette C{} |
| Achievements + Endings | 2993–3153 | 42 achievements, 6 endings, ENDING_DATA, endingAvailability() |
| Categories | 3155–3181 | CATEGORIES array |
| Quests + Boss lists | 3182–3262 | 28 quests, BOSSES_BASE (31), BOSSES_DLC (14) |
| UI constants + helpers | 3264–3272 | DASH_CATS, tier/prio colors, catClass, stepClass, h(), btnS() |
| UI primitives | 3274–3278 | ProgressRing, ProgressBar, Chk |
| **App component** | **3281–4746** | 24 useState hooks. Save migration for weapon slots. |
| renderCharacter (+ nested) | 3388–4202 | renderBuilds (3520), renderLoadout (3553) with live AR header, weaponSlotRow, arrow slots |
| renderWalkthrough | 4203–4373 | Step numbers (#N), step cards |
| renderDashboard | 4374–4434 | |
| renderAchievements | 4435 | |
| renderSettings | 4489 | Shows v3.2, correct data counts |
| Main render + tab routing | 4491–4746 | renderOptimizer (4494), TABS, renderers |
| Mount | 4747 | ReactDOM.render |
| Close | 4748–4749 | |

---

## IMPLEMENTATION STATE

### What's built and working (v3.2 — current baseline)

**File:** `Tarnished_Companion_v3.2.html` | **Lines:** 4,749

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

### v3.2 build scope (next delivery)

From v3.1 baseline, apply these changes:

1. **Level calc fix** — `totalPts-79+cls.lv` hardcodes 79 as base stat total. Wretch has 80 (10×8). Fix: compute from actual class base stats.
2. **Step numbers on walkthrough cards** — display `#stepnumber` in upper right corner of each card for reference during playtesting.
3. **Version display in header** — "COMPANION v3.2" displayed visually in the tool header after the word COMPANION. Minor version numbers 1–99.
4. **Stormfoot Catacombs ranged weapon issue** — walkthrough step requires shooting fire pillars but player may have no ranged weapon. Flag requirement or ensure ranged weapon acquisition is addressed in prior steps.

### Design decisions confirmed by playthrough (DD35–DD40)

| DD | Decision | Status |
|---|---|---|
| DD35 | Golden Seed is universal optimal keepsake | Confirmed |
| DD36 | Crafting Kit + Torch are mandatory first purchases for ALL classes | Confirmed |
| DD37 | Wretch IS universally optimal class (zero stat waste: 10×8=80, every point at minimum) | Confirmed |
| DD38 | Weapon upgrade level dominates stat investment in early game | Confirmed |
| DD39 | Walkthrough steps need power-gate filtering | Confirmed, not yet implemented |
| DD40 | Single recommendation over comparison tables | Confirmed, implemented in v3.1 |

### v3.x future roadmap (after v3.2)

- Replace renderBuilds (Fextralife copy-paste content) with archetype-computed recommendations
- Power-gated walkthrough filtering (suppress/flag steps unviable at current power level)
- Character creation screen: Wretch optimal, Golden Seed universal, Crafting Kit + Torch mandatory, class optimizer per archetype
- "Where to go next" — highest-value destination computed from current state and next boss gate
- Enemy resistance awareness in routing (e.g., miners resist slash, bring Club)
- Stat point advisor: account for weapon requirement breakpoints (e.g., "1 STR unlocks two-handing LGS")
- Fix Compare tab (React hooks violation in renderCompare — pre-existing)
- Kill the checklist, build the journey — walkthrough steps become backing data queried by engine, not a scrollable list

### Known limitations

- Upgrade level not tracked per weapon — uses regional cap
- Obtained items not tracked — weapon availability modeled by constraints
- Static HTML shell flashes before React hydrates
- Build-aware filtering covers 69 of 214 P3 steps
- Optimizer is endgame-only
- Compare tab broken (hooks violation, pre-existing)

---

## DEVELOPMENT PROTOCOL

**Context constraint:** The HTML file (~1.35 MB) cannot be uploaded to conversations. Use `split_for_claude.js` to split into data block (~900KB, stays local) + code block (~400KB, uploadable). After edits, `merge_from_claude.js` reassembles the complete file. Fallback: `extract_manifest.js` for structural recon (~4KB JSON output).

**Version numbering:** Minor versions 1–99 (v3.1, v3.2, ... v3.99). Version is displayed visually in the tool header as "COMPANION v[X.Y]". Hardcoded in the header string — find and replace on each delivery.

**Line map is memorized.** Do not rediscover structure each session. Reference the file structure table above. Line numbers shift after each delivery — update this document.

**Never load lines 69–2003.** That's inline JSON data — 69% of the file. All code edits target line 2004+.

**Batch edits into single scripts.** Python heredoc for multiple edits, create-then-inject for new functions. Target: 4–6 tool calls per feature.

**One feature per conversation.** State the target, draft in context, execute in one batch, verify in one bash call, deliver.

**Technical Authority inquiries.** All verification requests from Operational to Technical Authority follow: context + why it matters → authoritative basis cited → WHAT needs verification and WHY (never HOW — no diagnostic steps, line numbers, or tool choices) → scope boundary.

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
- **F5:** Ranged utility system. [DONE v3.2 — AMMO_DATA (30 entries) in engine, arrow/bolt slots in loadout UI, ammo auto-filters by weapon type, live AR = weapon + arrow combined, status effects displayed. Shortbow in Kalé mandatory purchases (B3).]
- **F6:** Dynamic weapon pool. [DONE v3.2 — builds async after first render (~1s). 98 unique weapons, 787 entries (28% of 2,764). 4x globalOptimize speedup (38ms vs 158ms). Same results, no static list to maintain. Header shows pool status indicator.]
- **F7:** Progression curves — per-archetype optimal weapon at each regional checkpoint. [DONE v3.3 — computeProgressionCurve engine + Progression sub-tab in Character. Archetype selector (13 templates), DLC toggle, weapon curve table with status coloring, weapon transition highlighting, expandable per-boss detail (top 3 1H/2H, stats, affinities, upgrade caps), summary footer.]

### ENHANCEMENTS (improve existing capability)
- **E1:** Step numbers on walkthrough cards. [DONE v3.2 — #stepnumber in upper right of each card, already implemented.]
- **E2:** Version display in header. [DONE v3.2 — "COMPANION v3.3" in header, already implemented.]
- **E3:** Stat advisor accounts for weapon requirement breakpoints. [PLANNED]
- **E4:** Enemy resistance awareness in routing. [PLANNED]

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

- **v3.3:** B10 (colossal STR fix), F2 (power-gated walkthrough banner), F3 (Next Objective dashboard panel with getNextMandatoryBoss), F7 engine (computeProgressionCurve, deriveGateState atStep, MANDATORY_BOSSES enriched with region/step/lvl). Boss name alignment across MANDATORY_BOSSES/BOSS_READY/BOSS_ENG_MAP. 11 new BOSS_READY entries (4 base, 5 DLC, 2 renamed). Lines: 4,567.

---

*Single project document | March 28, 2026*
*Replaces: v2_0_baseline.md, v2_0_design_spec.md, dev_operations_guide.md*
