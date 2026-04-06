# Technical Debt Register

---

## OPEN

(none)

---

## CLOSED

**TD-01: Duplicated defense curve in engDmgVsBoss / engSpellDmgVsBoss** | B2 | 2026-04-06
Extracted `engDefenseMult(ratio)` shared by both functions. Closed 2026-04-06.

**TD-02: Duplicated weapon pool filtering in computeProgressionCurve** | C3 | 2026-04-06
Extracted `filterArchPool(weapons,affPref,priStats,excludeDLC)`. Closed 2026-04-06.

**TD-03: isBuildRelevant dual-acceptance contract** | C3 | 2026-04-06
Dropped hardcoded archetype name map; uses STAT_TEMPLATES lookup only. Closed 2026-04-06.

**TD-04: detectBuildArchetype heuristic drift from STAT_TEMPLATES** | C3 | 2026-04-06
Rewrote to score against STAT_TEMPLATES targets, returns template ID. Closed 2026-04-06.

**TD-05: bestAshOfWar isDLC parameter unused** | C2 | 2026-04-06
Removed dead parameter from signature and call site. Closed 2026-04-06.

## DEFERRED

(none)
