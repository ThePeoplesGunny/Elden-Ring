# CLAUDE.md — Tarnished's Companion

## Project Intent & Boundaries

**IS:** Journey-aware progression planner — computes optimal moment-to-moment choices from character creation through every boss gate for any archetype. For one player (Gunny). Portable, offline, local-first.

**IS NOT:** A wiki. A build optimizer (optimizes progression, not final builds). A multiplayer coordinator. A guide (computes, doesn't narrate). Not a mobile app.

## Locked Decisions

Do not relitigate without new evidence (per global P6).

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Portable local-first architecture | Runs from a folder, no install, no cloud, cross-platform, CD-sized upper bound ≤700MB. | 2026-03 |
| 2 | All useState hooks in App component only | Pre-existing violation in Compare tab. Do not add more. | 2026-03 |
| 3 | One backlog item per conversation | Flexible when items are interconnected. Gunny may direct multiple. | 2026-03 |
| 4 | All structural reference in tarnished_companion_project.md | Single source of truth for file map, functions, data counts, backlog. Do not duplicate in CLAUDE.md. | 2026-03 |
| 5 | Legacy inline JSON (lines 69-2003) never loaded into context | Becomes moot when data migrates to external files during rewrite. | 2026-04 |

## Agents & Skills

Two agents in `.claude/agents/` evaluate from specialized perspectives:
- **engine-verifier** — numerical correctness of AR/damage computations vs community data
- **progression-analyst** — archetype viability across regional boss gates

Five skills in `.claude/commands/`:
- **/session-start** — state verification (version alignment, line counts, uncommitted work)
- **/session-close** — session close (3-artifact update + commit + push)
- **/verify** — change-type verification matrix
- **/game-data-verify** — cross-reference engine output against community data
- **/progression-engine** — compute archetype progression curves

Agents provide evaluation perspective. Commands provide execution sequences. Both coexist.

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

**Version:** v4.0.0-alpha (Phase B.1–B.7 + B-Overlay fanapis snapshot)
**Baseline:** `tc_next/` portable bundle (legacy `Tarnished_Companion_v3.9.html` preserved)
**Legacy lines:** 5,893
**Last completed task:** Governance command rename finalized - deliver -> session-close (canonical per framework P5); removed stray root deliver.md duplicate; repaired truncated Playtest-checkpoint line. Memory triage (user-level, outside repo): corpus 32 -> 17 surviving, 16 stashed, 1 P14 contradiction resolved (walkthrough R1-R23 tracker was NOT lost - detailed file present on disk).
**Next task:** Chest/world pickups per region, OR quest rewards, OR Phase C/D (tc_next journey view, unblocks playtest). Gunny to direct.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). Engine v3.15-calibrated. Live playthrough paused while rewrite phases land; resume R4 Limgrave cleanup once tc_next journey view ships.