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

**Version:** v3.14
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,888
**Last completed task:** v3.14 — Phase 0 steps 40-42 rewritten to match Gunny's live playthrough (Third Church of Marika pickups, Bestial Sanctum geometry, Fort Faroth transit path, mounted Greyoll farm at Fort Faroth SoG). FARM_TARGETS Greyoll reward 80K - 50K (Fextralife verified). Kill count revised 2 - 3 (150K runes at L51 Margit-comfort target). Engine math validated in-game across 12 stat configurations (HP/FP/Stam within plus-minus 1, AR exact at STR 20-plus). B13 scope refined - narrow STR-12 boundary bug, not systemic. Four new locked memory rules (verify game data, engine data suspect, pre-rec checklist, batch playtest commits). Archetype-vs-weapon forecast built and acquisition-verified against Fextralife. TheGamer article protocol test caught 1 false stat + 3 misleading progression claims.
**Next task:** Gunny to pick archetype commitment (top forecast: Bloodhound's Fang STR/DEX Quality AR 357 vs Margit; safe path Morning Star Pure STR AR 269 already owned). Then in-game Stat Optimizer spend of 150K runes to L51. Then Phase 0 close and R4 (post-commit Limgrave cleanup) begins.
**Playtest checkpoint:** Gunny at Fort Faroth SoG, Dragonbarrow/Caelid. Wretch level 3, Morning Star +3 equipped, 150,000 runes unspent. Three Greyoll kills complete. Engine calibration sweep complete (in-game reads matched engine within plus-minus 1 at all tested points). Awaiting archetype commit decision. Full state in `memory/project_playtest_state.md`.
