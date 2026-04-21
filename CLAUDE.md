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

**Version:** v4.0.0-alpha (Phase B.1 weapons + B.2 talismans ingested)
**Baseline:** `tc_next/` portable bundle (legacy `Tarnished_Companion_v3.9.html` preserved)
**Legacy lines:** 5,893
**Last completed task:** Phase B.2 — talismans ingestion. `data/talismans.json` canonical: 98 talismans (87 deliton base + 11 engine-only stubs so canonical = deliton ∪ engine). Engine overlay (tc_next/data/talismans_engine.json, 41 entries) applied for weight + parsed effect/value/note on 41 matching rows. Fextralife harvest (data/talisman_acquisition.json, 21 entries) applied 21/21. 4 weight corrections where engine and Fextralife disagreed — Fextralife wins (Bull-Goat's 1.4→0.5, Ritual Sword 0.7→0.9, Axe 0.7→0.8, Roar 0.8→0.7). 7 case-only name normalizations to engine canonical. Coverage: 57% weight, 42% engineEffect, 21% acquisition. Unharvested: 77/98 (next Fextralife batches close this gap).
**Next task:** Phase B.3 — armors ingestion (568 deliton records per REWRITE_PLAN §3). Parallel: expand Fextralife harvests for weapons (56→306) and talismans (21→98) via targeted sub-agent batches. B.2 pipeline established a clean union-ingest pattern (deliton ∪ engine) that generalizes to item classes where engine has curated subsets with unique fields.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). Engine v3.15-calibrated. Live playthrough paused while rewrite phases land; resume R4 Limgrave cleanup once tc_next journey view ships.
