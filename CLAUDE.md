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

**Version:** v3.13 (three fixes applied)
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,888
**Last completed task:** Phase 0 walkthrough validated against Gunny's in-game playthrough through step 39 (Morning Star +3 upgrade + 2 STR at Church of Elleh). AR values corrected to match in-game equipment panel (154 1H / 161 2H). B13 engine AR rounding bug logged.
**Next task:** Resume at Phase 0 step 40 when Gunny returns (Portal to Bestial Sanctum → Greyoll farm). Development-wise: R4 (post-Greyoll Limgrave cleanup) pending after Phase 0 validation completes. B13 engine fix queued as non-blocking.
**Playtest checkpoint:** Gunny paused at Church of Elleh, post-step-39. Wretch level 3, Morning Star +3 equipped (12 STR / 10 DEX), next in-game action is warp to Third Church of Marika for the portal. Full state in `memory/project_playtest_state.md`.
