# Technical Debt Register

---

## OPEN

**TD-01: Duplicated defense curve in engDmgVsBoss / engSpellDmgVsBoss** | B2 | 2026-04-06
Lines ~2432-2436 and ~2484-2488 contain identical piecewise defense multiplier logic. Formula correction requires touching both functions.

**TD-02: Duplicated weapon pool filtering in computeProgressionCurve** | C3 | 2026-04-06
Lines ~2799-2818: baseArchPool and dlcArchPool blocks are near-identical affinity/stat filters differing only by DLC check. Extractable.

**TD-03: isBuildRelevant dual-acceptance contract** | C3 | 2026-04-06
Accepts both archetype names ("strength") and template IDs ("pure_str") via hardcoded map + STAT_TEMPLATES fallback. Undocumented dual mode.

**TD-04: detectBuildArchetype heuristic drift from STAT_TEMPLATES** | C3 | 2026-04-06
Inference thresholds (e.g., str>=40) don't align with template target stats (e.g., pure_str targets str:55). Can produce mismatches.

**TD-05: bestAshOfWar isDLC parameter unused** | C2 | 2026-04-06
Function accepts `isDLC` but never uses it. Dead parameter from incomplete refactoring.

---

## CLOSED

(none)

## DEFERRED

(none)
