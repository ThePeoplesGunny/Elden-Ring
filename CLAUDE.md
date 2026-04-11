# CLAUDE.md — Tarnished's Companion

## Project-Specific Delivery Close

Every delivery updates these three artifacts (per global §VI.5):

1. **CLAUDE.md Current State** — version, baseline file, lines, last task, next task
2. **tarnished_companion_project.md** — backlog item status → DONE v[X.Y], file structure line ranges re-verified, new functions/components documented
3. **Git commit:** `v[X.Y]: [backlog ID] — [what changed]` — push to remote immediately

## Operating Rules

- **Never load lines 69–2003 into context.** Inline JSON data block (~69% of file). Use targeted grep/sed.
- **All useState hooks live in App component only.** Pre-existing violation in Compare tab — do not add more.
- **Single-file offline architecture is final.**
- **One backlog item per conversation** (flexible when items are interconnected — Gunny may direct multiple items per session).
- **All structural reference** (file map, engine functions, data counts, design decisions, backlog, roadmap) **lives in `tarnished_companion_project.md`.** That is the single source of truth. Do not duplicate it here.

## Current State

**Version:** v3.11
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,881
**Last completed task:** B12 R1 — Walkthrough reconstruction Phase 1 (Cave of Knowledge → Gatefront, 35 sequential steps replacing 14 broken/gappy entries)
**Next task:** B12 R2 — Gatefront → Bridge of Sacrifice → Weeping Peninsula Phase 0 essentials (per `memory/project_walkthrough_reconstruction.md`)
