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
**Last completed task:** Engine recalibration — fixed B14 (FP table), B15 (EquipLoad table), B16 (rune cost formula), B17 (defense curve shape — 30% damage overestimate), B18 (HP offset), B19 (Discovery off-by-one). All 17 verification points now match Gunny's in-game reads exactly (Δ = 0.0).
**Next task:** Gunny to direct next items for verification OR authorize archetype commit under the corrected engine. Note: B17 fix drops melee damage predictions ~27% at realistic attack ratios — archetype ranking may shift vs pre-fix forecast (Bloodhound's Fang AR 357 claim was computed under broken defense math).
**Playtest checkpoint:** Gunny at Fort Faroth SoG, Dragonbarrow/Caelid. Wretch level 3, Morning Star +3 equipped, 150,000 runes unspent. Three Greyoll kills complete. Engine now authoritatively calibrated against Fextralife + Drake Ravenwolf Steam guide + Gunny in-game reads. Archetype decision pending; commitment not yet made.
