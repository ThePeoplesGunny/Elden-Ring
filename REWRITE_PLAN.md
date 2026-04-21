# Tarnished's Companion — Comprehensive Rewrite Plan
**Date:** 2026-04-20 | **Status:** Draft for Gunny review

---

## 1. Where we are right now (honest assessment)

### What works
- **Engine math is verified accurate** at realistic stat ranges (v3.15 recalibration: HP/FP/Stam/EL/Discovery match in-game exactly, AR matches for tested weapons, rune cost table replaced with Fextralife-authoritative formula, defense curve fixed to match Fextralife's piecewise quadratic).
- **Boss data verified** for Margit / Godrick / Rennala — all HP/defense/negation/status values match Fextralife exactly. Likely the remaining 170 boss entries are similarly accurate; spot-checks have been 100%.
- **Archetype math** (stat allocation optimizer, weapon-vs-boss damage ranking, talisman loadouts) produces coherent relative rankings.
- **Live-play validation** proved the engine computes correct answers — the failures have been in the data feeding it, not the math.

### What's broken / limiting
- **Architecture**: monolithic 5,893-line HTML file. Inline JSON data block (lines 69–2003) is ~900KB and unloadable in context. Engine + React + UI + all data tangled together. Any non-trivial change requires working around the inline-blob constraint.
- **Data incompleteness** (the real blocker):
  - Weapons: 441 unique in engine but only 30 have acquisition step, and several of those are wrong (Coded Sword, Halo Scythe). Our Fextralife harvest added 56 more with verified data.
  - Talismans: 41 curated out of ~154 base-game; our harvest added 21 with verified location.
  - Armor: 18 curated out of ~65 sets; no acquisition data.
  - Ashes of War: 15 curated out of ~100+; acquisition only as step numbers.
  - Spirit Ashes: not tracked at all (0 of ~60+).
  - Spells: partial tracking with step numbers (B12-reconstruction incomplete).
  - Keys / Bell Bearings / Whetblades: minimal tracking.
- **Walkthrough reconstruction (B12)**: only Phase 0 region rebuilt (s:1–43). R4–R23 pending. Walkthrough step numbers are unreliable across ~80% of the game.
- **UI limitations**: no query surface for "weapons meeting my stats in my region"; no visual map; Compare tab has a pre-existing hooks violation; no resource-tracking view; walkthrough is a scrollable list not a navigable graph; no "mark owned" state.
- **Known engine bugs**: B13 (AR boundary case, narrow), B20 (motion value modeling missing — hits-to-kill is R1-floor only).

### What the user actually needs (learned from live playtest)
- Answer "what's the best weapon for my archetype that I can acquire and wield right now?"
- Answer "what's my optimized path through this region before the next boss gate?"
- Answer "where do I go to get item X?" — with a visual map.
- Answer "what stat breakpoints unlock meaningful gear upgrades in the next region?"
- All filtered through the **archetype transition pattern**: transitional tool → resource accumulation → unlock → archetype-optimal gear → boss gate validates.

---

## 2. Target architecture

### Directory layout
```
tarnished_companion/
├── index.html                  # UI shell, routes to SPA views
├── app/                        # React/vanilla JS UI
│   ├── main.js                 # entry, routing
│   ├── views/
│   │   ├── character.js        # stat commit, loadout, archetype selector
│   │   ├── journey.js          # region-by-region pathing
│   │   ├── map.js              # Leaflet-based interactive map
│   │   ├── compare.js          # weapon/build compare (rebuild, no hooks violation)
│   │   ├── dashboard.js        # next-boss readiness, recommended actions
│   │   └── items.js            # searchable catalog (weapons, talismans, etc.)
│   ├── components/             # shared UI pieces
│   └── styles.css
├── engine/                     # pure computation, no UI deps
│   ├── index.js                # public API surface
│   ├── ar.js                   # engCalcAR, scaling, decode
│   ├── damage.js               # engDmgVsBoss, engDefenseMult, status
│   ├── stats.js                # HP/FP/Stam/EL/Discovery curves
│   ├── rune_cost.js            # formula-based
│   ├── optimizer.js            # stat allocator, bestWeaponForBoss
│   └── archetype.js            # 13 archetype templates + transition logic
├── data/                       # DB of record
│   ├── weapons.json            # all 441 unique × acquisition × stats
│   ├── armors.json             # all sets
│   ├── talismans.json          # all 154
│   ├── spirits.json            # all spirit ashes
│   ├── ashes_of_war.json       # all AoWs
│   ├── sorceries.json
│   ├── incantations.json
│   ├── bosses.json             # all 173
│   ├── creatures.json          # enemy-drop sources
│   ├── locations.json          # region → landmark → coords
│   ├── items.json              # keys / tears / consumables / misc
│   └── walkthrough.json        # region-ordered steps (rebuilt via B12)
├── assets/
│   ├── maps/                   # 7 regional base-map images (~150MB)
│   └── items/                  # optional item icons (~100MB from deliton)
├── server.py                   # OR server.js — single-command startup
├── README.md                   # how to run, architecture overview
└── CLAUDE.md, tarnished_companion_project.md — unchanged home
```

### Tech stack (minimum)
- **Data**: JSON files (SQLite considered if query performance requires it; start JSON)
- **Server**: Python's built-in `http.server` OR Node's built-in `http` — single file, zero packages. Start with `python -m http.server 8000`.
- **UI**: vanilla JS or preserved React (decide during migration). Leaflet for map.
- **No build step**: source-is-runtime. Open `index.html` via the server and it works.
- **Persistence**: localStorage for player state (owned items, committed archetype, walkthrough progress).

### Why not SQLite immediately
JSON files are debuggable in any text editor, diffable in git, readable by any tool. SQLite adds a query layer but also adds a binary file and a dependency (`sqlite3` in Python or `better-sqlite3` in Node). Start JSON; upgrade to SQLite only if query times exceed ~50ms on realistic filters.

---

## 3. Data strategy

### Sources and their roles
| Source | Purpose | Coverage | Trust |
|--------|---------|----------|-------|
| deliton/Kaggle JSON | Stats, requirements, scaling, weight, effects | 307 weapons, 87 talismans, 568 armors, 90 AoW, 64 spirits, 71 sorc, 98 incant, 106 bosses, 115 creatures, 177 locations, 462 items | High (cross-validated) |
| Fextralife wiki | Acquisition / location / prerequisites / drop rates | Comprehensive | High but must verify per-item |
| Engine's existing ENG_DATA | Encoded weapon scaling math (2,764 variants incl. affinities) | Complete | Verified via in-game reads |
| Our Fextralife harvest (batches 1–2) | Verified pre-Margit weapons + talismans | 56 weapons + 21 talismans | Highest (spot-checked + engine-matched) |

### Ingestion pipeline (phase 1 data)
```
deliton JSON → schema normalizer → data/*.json
                                       ↓
                          acquisition fields null
                                       ↓
                 Fextralife harvest (targeted, narrow agents)
                                       ↓
                          acquisition fields populated
                                       ↓
                   cross-validation vs engine + our existing harvest
                                       ↓
                               committed
```

### What NOT to do
- Don't discard verified Fextralife-harvested entries (batches 1–2). Merge, don't replace.
- Don't trust engine's WEAPON_STEPS — it has documented errors (Coded Sword, Halo Scythe). Rebuild from Fextralife-verified acquisition data.
- Don't invent location data. Every entry cites source URL.

### Location data problem (honest view)
- Weapons/talismans/armor/AoW/spirits in deliton have NO location fields.
- Bosses.csv / creatures.csv drops cover ~40-50% of items (boss drops + common enemy drops).
- Chest / corpse / merchant-sold items still require per-item Fextralife fetch or visual map scrape.
- Solution: structured landmark taxonomy (proposed earlier) + optional lat-norm pins when we have a map.

### Map data
- Base region images: acquire from one of:
  1. Fextralife interactive map (community wiki, scrape-tolerant)
  2. In-game screenshots (clean, manual, slow)
  3. Open-data community maps on GitHub (audit license, cross-reference)
- Coordinate placement: manual pin-per-item, or from the same scraped map if embedded in JS.
- Storage: `{region, x_norm: 0..1, y_norm: 0..1}` per item.

---

## 4. UI rewrite — views and flow

### Core principle
**The UI should answer specific user questions, not present data.** Each view has a single job.

### View 1: Character — commit & loadout
- Archetype selector (13 templates)
- Stat allocator with in-game-matching predictions (post-v3.15 calibration)
- Current loadout (weapon, talisman, armor, spirit) with live AR / damage-vs-next-boss
- "Mark owned" state for items (drives eligibility in other views)

### View 2: Items — filterable catalog
- Master table across all item classes
- Filters: stat-eligible (based on current stats + Soreseal equipped), archetype-fit, region reachable, acquired-state, DLC toggle
- Sort: damage vs next boss, weight, drop-rate, acquisition difficulty
- Row click → item detail panel: stats, scaling, weight, acquisition route, map pin, similar items

### View 3: Map — spatial routing
- Leaflet map with regional tiles
- Pins colored by item class, filterable by archetype fit
- Current character position indicator (manual, or derived from last marked SoG)
- Click pin → item detail, "add to route" button
- Route planner: ordered list of pins → optimal traversal order (shortest-path heuristic)

### View 4: Journey — region-phase planner
- Regions as cards in order: Limgrave → Stormveil → Liurnia → etc.
- Each card: boss gate stats, required power level, recommended loadout at entry, recommended pickups in region
- Archetype-transition view: "transitional tool now" → "resources to accumulate" → "archetype-optimal upgrade before next gate"
- Checkoffs persist to localStorage

### View 5: Dashboard — summary
- Next boss: name, readiness badge, recommended weapon+talisman+armor, hits-to-kill (R1 floor + realistic estimate)
- Recommended actions (ranked): "pick up X (Y runes to unlock)", "level to Z", "upgrade weapon to +N (M stones needed)"
- Rune budget: what it buys at current level

### View 6: Compare (rebuild)
- Side-by-side weapon compare
- Fix hooks violation from current implementation
- Auto-suggest comparisons ("this weapon vs your current")

### UX improvements over current
- Single-boss damage prediction → multi-boss trajectory (show AR across the next 5 bosses)
- "What-if" archetype exploration without actually committing
- Visual acquisition path (map + list) replaces text-only location strings
- Actual search across all item classes (currently limited to weapons via optimizer)
- Cross-referenced warnings: "this weapon requires Heavy Whetblade you haven't picked up yet"
- Progress tracking for walkthrough steps, picked-up items, killed bosses
- Export/import save state (portable across machines)

---

## 5. Phasing — order of work

### Phase A: Architecture migration (no data changes, no feature loss)
1. Split current monolithic HTML:
   - Extract engine functions → `engine/*.js`
   - Extract ENG_DATA inline JSON → `data/*.json` (by category)
   - Extract React UI → `app/*.js`
2. Add `server.py` single-command startup
3. Verify feature parity with current HTML
4. Smoke-test: existing Stat Optimizer, AR Estimator, etc., produce identical results
5. Commit as `v4.0.0` baseline

### Phase B: Data population (per item class)
6. Ingest deliton JSON → normalized `data/*.json` with `acquisition: null` flags
7. Merge Fextralife-harvested acquisition data (batches 1–2)
8. Batch-harvest remaining Fextralife acquisition via targeted agents
9. Fill items.json (keys, tears, consumables, misc) from deliton `obtainedFrom` + Fextralife gap-fill
10. Cross-validate against engine's existing values (catch regressions)
11. Expand bosses from 173 verified → add drops/locations

### Phase C: Map + landmark taxonomy
12. Acquire base region maps
13. Build landmark taxonomy (controlled vocabulary `region.sublocation.landmark`)
14. Harvest / manually place item coords
15. Integrate Leaflet view, wire item detail → map pin

### Phase D: UI rewrite per view
16. Character view (commit + loadout) — port from current Character tab
17. Items view (filterable catalog) — new
18. Dashboard (readiness + recommended actions) — port + expand
19. Journey (region-phase planner) — new
20. Compare (rebuild without hooks violation) — fix + port
21. Map view — new

### Phase E: Walkthrough reconstruction (continues in parallel)
22. Complete B12 region-by-region rebuild (R4–R23)
23. Tie walkthrough steps to item pickups in data/*.json (bidirectional cross-reference)

### Phase F: Engine fill-in
24. B13 (AR boundary case)
25. B20 (motion value modeling) — requires ingesting motion value data from deliton or datamining
26. Status buildup verification on blood-affinity weapons
27. Spell damage precision

---

## 6. Migration plan — how we get from here to there without breaking things

### Gate: don't leave the current HTML in a broken state until Phase A is complete
- Phase A runs on a branch or in a new folder (`tc_next/`) so current `Tarnished_Companion_v3.9.html` keeps working during the rebuild.
- Once Phase A hits parity, switch default to new structure, archive the monolith as `legacy/`.

### Gate: data changes must be cross-validated
- Every new `data/*.json` must be cross-checked against the engine's existing ENG_DATA values for items both tables cover.
- Discrepancies flagged, investigated, resolved before commit.

### Gate: verified harvested data is sacrosanct
- `data/weapon_acquisition.json` (56 entries) and `data/talisman_acquisition.json` (21 entries) are the gold standard.
- Any ingestion pipeline that overwrites those without manual review = bug.

### Backward compatibility (transitional)
- Current project knows nothing about the new architecture; that's fine. New architecture reads the same underlying truth (Fextralife + engine math) so answers should match.
- `scripts/*` calibration scripts remain useful for validating engine math through any rewrite.

---

## 7. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scraping Fextralife at scale gets us rate-limited | Medium | Medium | Throttle agents; cache locally; respect robots.txt |
| Mapgenie-style commercial scrape legal issues | (declined by user) | — | Using Fextralife + open data only |
| Data quality drift between game patches | Low | Low | Record `gameVersion` per data entry; accept fixed-version snapshot |
| Phase A migration introduces regressions | Medium | High | Smoke-test every engine function against calibration scripts before merging |
| Scope creep (rewriting too much at once) | High | High | Strict phase gates; Phase A must land before B begins |
| Walkthrough reconstruction drags the whole project | High | Medium | Parallelize B12 with data pop; don't block UI on walkthrough completeness |
| Map image acquisition stalls on source / legal | Medium | Medium | Phase C can fall back to landmark taxonomy without map images |
| We over-engineer and never ship | Medium | High | Each phase has a "functional demo" checkpoint — must be user-runnable at the end of each phase |

---

## 8. Open questions — decide before we start Phase A

1. **Tech choice for server layer**: Python's `http.server` (pre-installed on most dev machines) or Node's `http` module (cleaner cross-platform)? Or both with a simple launcher script? simple launcher script that checks for prerequisites (python or node) and provides instructions if not met

2. **UI framework**: keep React (mature, already working) or go vanilla JS (simpler, no build step, fewer deps)? React has a build step only if we use JSX; we could use `React.createElement` directly like the current implementation does. whichever framework produces the better UI experience, polished is important

3. **Item coordinate source priority**: Fextralife interactive map scrape first? Or start with landmark-taxonomy-only and defer coords to Phase C completion? map scrape first (polished remember?)

4. **Walkthrough — parallel or serial with data pop?** I'd recommend parallel (different agent per region) but that's concurrency risk on our existing memory. Suggest: walkthrough reconstruction deferred until after Phase A+B ship. concur with suggestion

5. **Backward-compatibility with existing `Tarnished_Companion_v3.9.html`**: keep it alive as `legacy/` for reference, or delete once new structure is fully parity? keep alive as legacy

6. **Item images** (2000+ PNGs from deliton CDN): include in bundle (~100MB) or reference by URL (breaks offline)? If bundling, how to cache/ship them — rsync the deliton CDN once and mirror locally? rsync once and mirror local

7. **Scope of DLC (Shadow of the Erdtree)**: in scope for this rewrite or base game only? Affects count by ~200 items, +1 region, +5 mandatory bosses. Shadow of the Erdtree is in scope

---

## 9. Proposed immediate next actions

If this plan is approved, I'd start with **Phase A step 1** — split the monolithic HTML into engine + data + app directories, verify parity via existing calibration scripts, commit as v4.0.0 baseline. This is a large-ish change but purely mechanical (no new features, no new data), and it unblocks everything downstream.

Estimated effort: 1–2 working sessions, most of it automated extraction + validation.

---

## 10. What's NOT in this plan (explicitly out of scope)

- Multiplayer / co-op view (Elden Ring multiplayer is out of the progression-optimization wheelhouse)
- Character builder export to third-party calculators (proprietary formats)
- Video tutorial embedding
- Boss fight strategy walkthroughs (tool calculates, doesn't prescribe tactics)
- AI-generated content (every recommendation stays computed from data)

---

*This plan is a proposal. Comments / adjustments / red-lines welcome before commit.*
