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
**Lines:** 5,893
**Last completed task:** Engine recalibration (B14-B19 fixed), post-fix archetype forecast, 3 boss defense/negation values verified vs Fextralife (Margit/Godrick/Rennala all match exactly), empirical B17 check at Gatefront (Morning Star vs Soldier of Godrick) surfaced B20 (engine lacks motion value modeling — hits-to-kill output is R1-only worst-case floor; realistic ~0.65x floor). Forecast script updated to display both columns.
**Next task:** Gunny to authorize archetype commit under corrected engine. Top R1-floor / realistic forecasts vs Margit: Bloodhound's Fang 17 / ~11 hits (MED hazard Darriwil, best damage); Morning Star 21 / ~14 hits (owned, zero hazard, HP 1727); Uchigatana 22 / ~14 hits (LOW hazard, Deathtouched Catacombs). Relative rankings trustworthy; absolute floors under-sell real play due to B20.
**Playtest checkpoint:** Gunny at Gatefront SoG (temporarily — tested vs soldiers), formerly Fort Faroth. Wretch level 3, Morning Star +3 equipped, 150,000 runes unspent. Three Greyoll kills complete. Engine now authoritatively calibrated; all 17 stat-derived verification points match in-game exactly (delta = 0). Boss data verified. Archetype decision pending; commitment not yet made.
