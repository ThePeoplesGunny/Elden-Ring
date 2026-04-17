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

**Version:** v3.13 (six fixes applied)
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,888
**Last completed task:** v3.13 fix 6 - Step 40 Bestial Sanctum arrival corrected again per Gunny's in-game observation: portal deposits player RIGHT IN FRONT OF the Sanctum door, no Black Blade Kindred or wall-hugging required. Removed obsolete BBK/stealth instructions from step 40.
**Next task:** Resume at Phase 0 step 41 (Torrent transit to Greyoll) once Gunny rests at the Bestial Sanctum SoG. Development-wise: R4 (post-Greyoll Limgrave cleanup) pending after Phase 0 validation completes. B13 engine fix queued as non-blocking.
**Playtest checkpoint:** Gunny has warped in, standing in front of the Bestial Sanctum door in Dragonbarrow. Wretch level 3, Morning Star +3 equipped. Next in-game action is to open the door and rest at the SoG on the right-hand side to register fast travel. Full state in `memory/project_playtest_state.md`.
