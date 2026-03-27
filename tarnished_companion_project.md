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
| `globalOptimize(lvl, bosses, tmpls, opts)` | 2216 | Exhaustive class × template × weapon search → top 10 |
| `bestWeaponForBoss(boss, stats, gate, region, 2h)` | 2335 | Top 10 weapons for a single boss given player state |
| `getPlayerBossDmg(bossName, charState)` | 2179 | Single-weapon damage against a specific boss |
| `deriveGateState(ci)` | 2765 | Journey checkoffs → unlocked affinities + upgrade caps |
| `resolveTacticalNeeds(bossName, ci)` | 2836 | Boss + checkoffs → tactical mitigation options |
| `detectBuildArchetype(stats)` | 2856 | Derive archetype from player stats |
| `endingAvailability(ci, qp)` | 3030 | Checkoffs + quest progress → ending status |
| `engHP/engFP/engStam/engEquip` | 2361–2364 | Derived stat curves |

---

## FILE STRUCTURE

**File:** `Tarnished_Companion_v2.html` | **Lines:** 4,392 | **Size:** 1.35 MB

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline data (DO NOT LOAD)** | **69–2003** | Regions, ENG_DATA, ENG_GRAPHS (~69% of file) |
| Engine functions | 2004–2392 | Safe to load in full |
| UI helpers | 2401–2706 | |
| Character system + gates | 2707–2857 | REGION_CAPS, BOSS_READY, whetstones, bells, tactical, archetypes |
| Stat calc helpers | 2880–2925 | |
| App core | 2926–3141 | Achievements, endings, categories |
| Quests | 3142–3227 | |
| UI primitives | 3228–3240 | |
| **App component** | **3241** | All useState hooks live here |
| State helpers + export/import | 3283–3330 | |
| React UI components | 3334–4135 | 16 render functions |
| Optimizer UI | 4134–4149 | renderOptimizer, runOptimizer |
| Mount | 4389 | ReactDOM.render |
| Close | 4390–4392 | |

---

## IMPLEMENTATION STATE

### What's built and working (v3.1 — current baseline)

**File:** `Tarnished_Companion_v3.1.html` | **Lines:** 4,608

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

*Single project document | March 27, 2026*
*Replaces: v2_0_baseline.md, v2_0_design_spec.md, dev_operations_guide.md*
