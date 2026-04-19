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
**Last completed task:** Corrected archetype_forecast.js target level — hardcoded L51 replaced with `CURRENT_LEVEL + levelsFromRunes(CURRENT_LEVEL, RUNE_BUDGET)`. Gunny caught that 150K runes at L3 reaches L41 (not L51 — prior v3.14 L51 figure was derived from broken B16 rune cost math). Allocations re-derived with correct 40 spendable points.
**Next task:** Gunny to authorize archetype commit at L41. Realistic forecasts vs Margit (~0.65x R1 floor): Morning Star VIG 44/END 12/STR 14 → HP 1555, ~14 hits, zero hazard; Bloodhound's Fang VIG 39/END 12/STR 12/DEX 17 → HP 1402, ~11 hits, MED hazard (Darriwil); Uchigatana VIG 42/END 12/DEX 16 → HP 1503, ~14 hits, LOW hazard. Pre-committed 2 STR points from L1→L3 are locked until Rennala respec — wasted on pure-DEX builds (Flail/Uchigatana/Reduvia).
**Playtest checkpoint:** Gunny at Gatefront SoG (temporarily — tested vs soldiers), formerly Fort Faroth. Wretch level 3, Morning Star +3 equipped, 150,000 runes unspent. Three Greyoll kills complete. Engine now authoritatively calibrated; all 17 stat-derived verification points match in-game exactly (delta = 0). Boss data verified. Archetype decision pending; commitment not yet made.
