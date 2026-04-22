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

**Version:** v4.0.0-alpha (Phase B.1–B.4 ingested: weapons, talismans, armors, spells)
**Baseline:** `tc_next/` portable bundle (legacy `Tarnished_Companion_v3.9.html` preserved)
**Legacy lines:** 5,893
**Last completed task:** Phase B.4 — sorceries + incantations ingestion. `data/sorceries.json` (72) + `data/incantations.json` (110). Engine overlay contributes school, damageType, chargeAble, engineNote + normalized requirements. spell_dmg.json + spell_step.json overlay motionValue/castTime/walkthroughStep. 6 case-only name normalizations. 13 engine-only stubs (1 sorcery: Terra Magica; 12 incantations including Golden Vow, Catch Flame, Flame Sling — common base-game incantations missing from Kaggle). 5 requirement drifts flagged where Kaggle vs engine disagree (Ancient Dragons' Lightning Spear kaggle fai=0 is clearly broken; engine 32 authoritative).
**Next task:** Phase B.5 — ashes of war (90 Kaggle rows, 15 engine-curated). Phase B.6 — spirits (64 Kaggle, no engine coverage). Phase B.7 — items (462 Kaggle + deliton items.json, heterogeneous — keys/tears/consumables). Parallel: Fextralife harvest expansion remains the critical-path unblocker for all downstream arbitration.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). Engine v3.15-calibrated. Live playthrough paused while rewrite phases land; resume R4 Limgrave cleanup once tc_next journey view ships.
