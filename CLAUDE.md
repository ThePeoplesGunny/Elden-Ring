# CLAUDE.md — Tarnished's Companion

## Project-Specific Delivery Close

Every delivery updates these three artifacts (per global §VI.5):

1. **CLAUDE.md Current State** — version, baseline file, lines, last task, next task
2. **tarnished_companion_project.md** — backlog item status → DONE v[X.Y], file structure line ranges re-verified, new functions/components documented
3. **Git commit:** `v[X.Y]: [backlog ID] — [what changed]` — push to remote immediately

## Operating Rules

- **Portable local-first architecture.** Project runs entirely on the player's machine with no external dependencies at runtime. Small embedded stacks (SQLite, a minimal local file-server, Leaflet + static tiles) are acceptable when they meaningfully improve maintainability or capability. Criteria:
  - Portable: runs from a folder, no install beyond common runtimes (Node OR Python OR Go — default to what's already present)
  - Low maintenance: single-command startup, clear dependency list, ideally zero npm/pip packages
  - Offline: no cloud, no external APIs at runtime
  - Cross-platform: Windows / Mac / Linux
  - CD-sized upper bound: entire portable bundle ≤ ~700MB
- **Legacy constraint (transitional):** `Tarnished_Companion_v3.9.html` inline JSON block (lines 69–2003) — never load into context; use grep/sed. This constraint becomes moot once data migrates to external `data/*.json` / SQLite files during the architecture rewrite.
- **All useState hooks live in App component only.** Pre-existing violation in Compare tab — do not add more.
- **One backlog item per conversation** (flexible when items are interconnected — Gunny may direct multiple items per session).
- **All structural reference** (file map, engine functions, data counts, design decisions, backlog, roadmap) **lives in `tarnished_companion_project.md`.** That is the single source of truth. Do not duplicate it here.

## Current State

**Version:** v3.15
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,893
**Last completed task:** Batch 2 delivery: pre-Margit talisman acquisition DB (21 entries)
**Next task:** R4 begins — post-commit Limgrave cleanup. Push Morning Star to +6 with Smithing Stones available at Limgrave Tunnels + merchants. Engage Stonedigger Troll, Scaly Misbegotten, Castle Morne, Murkwater Cave, Coastal Merchant ranged utility, Deathtouched Catacombs (Uchigatana optional), Stormfoot cleanup, Stormhill approach. Target: Margit fight at realistic ~10-12 hits with Morning Star +6 at L41.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). All calibration verified at current stats. Ready for R4 Limgrave cleanup. Full state in memory/project_playtest_state.md.
