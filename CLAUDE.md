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

**Version:** v3.15
**Baseline file:** `Tarnished_Companion_v3.9.html`
**Lines:** 5,892
**Last completed task:** **PHASE 0 CLOSED.** Archetype committed (Pure STR / Morning Star). L41 Wretch: VIG 44, END 12, STR 14, rest 10. All 5 in-game readouts match engine exactly (HP 1555, FP 78, Stam 99, EL 51.4, Discovery 110). B21 (stamina off-by-one at intermediate END values) caught post-commit by Gunny and patched with Fextralife verbatim table.
**Next task:** R4 begins — post-commit Limgrave cleanup. Push Morning Star to +6 with Smithing Stones available at Limgrave Tunnels + merchants. Engage Stonedigger Troll, Scaly Misbegotten, Castle Morne, Murkwater Cave, Coastal Merchant ranged utility, Deathtouched Catacombs (Uchigatana optional), Stormfoot cleanup, Stormhill approach. Target: Margit fight at realistic ~10-12 hits with Morning Star +6 at L41.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). All calibration verified at current stats. Ready for R4 Limgrave cleanup. Full state in memory/project_playtest_state.md.
