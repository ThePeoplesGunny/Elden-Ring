# Tarnished's Companion — Live Playthrough Test Log
## Session: March 22, 2026
## Player: Wretch, Xbox, fresh character

---

## CRITICAL DESIGN FAILURES (systemic)

### F1: Tool is a checklist, not a companion
The walkthrough presents 1,679 steps as checkboxes with a completion percentage. Player had to click 8 tutorial steps just to reach Church of Elleh. Reward: "7%". No guidance on what to do next, what matters, or why.

### F2: No computation reaches the player
The engine has validated AR calc (29/29), 2,764 weapons, 173 boss resistance profiles, gate tracking, tactical needs — none of it surfaces at decision points. The Loadout tab was a pure equipment tracker with no damage computation. The AR Estimator required manual input of values the engine already knows.

### F3: Walkthrough has no power gating
Steps are ordered geographically, not by viability. Player was directed to a Runebear encounter (instant death at level 2), Darriwil evergaol (1,480 HP boss impossible at +0 weapon), and other content that is mathematically unwinnable at current power level. The engine can compute this — it doesn't.

### F4: Fextralife content where computation belongs
"Recommended Builds" tab (renderBuilds) is 8 hardcoded builds with names, weapon lists, talisman picks — static reference content. Should be replaced with archetype-computed recommendations from engine data.

### F5: False choices without player knowledge
Player presented with options they cannot evaluate: which weapon to upgrade, where to put stat points, which merchant items matter, which affinity to apply. The tool has the data to answer all of these and shows none of it.

---

## SPECIFIC BUGS FOUND

### B1: Level calculation wrong for Wretch (FIXED in v3)
`var level=totalPts-79+cls.lv` hardcodes 79 as base stat total. Wretch has 80 (10×8). Shows level 5 when player is level 4. Fixed to compute from actual class base stats.

### B2: Weapon analysis showed empty results (FIXED in v3)
Lordsworn's Greatsword only exists in ENG_DATA with affinity 1 (Heavy) and 3 (Quality) — no Standard (0) entry. When Whetstone Knife wasn't checked off, code searched only for affinity 0, found nothing, showed blank panel. Fixed to search all affinities in data, flag locked ones.

### B3: Compare tab shows blank screen (PRE-EXISTING)
renderCompare (line 2393) calls React.useState inside a nested function — hooks rule violation. May have been broken in v2 as well. Not caused by v3 edits.

---

## FEATURES BUILT THIS SESSION

### Added: Weapon Analysis Panel (renderLoadout)
- Computes AR for all equipped weapons across all affinities in engine data
- Shows single recommendation: best weapon + affinity + upgrade level
- Current vs Optimal side-by-side display
- Hits-to-kill against next boss gate (Margit)
- Collapsible detail view for all options
- Flags locked affinities with instructions to obtain whetstone
- Tactical needs for next boss displayed below

### Added: Next Level-Up Advisor (renderLoadout)
- Computes value of +1 in each stat against equipped weapon and next boss
- Recommends VIG until 20 (survivability), then highest damage stat
- Shows per-stat breakdown: AR gain, damage gain, HP gain, stamina gain

---

## DECISION POINTS WHERE TOOL FAILED (in order of gameplay)

| # | Decision Point | What player needed | What tool provided |
|---|---|---|---|
| 1 | Class selection | "Wretch optimal for stat efficiency — here's the math" | Nothing |
| 2 | Keepsake selection | "Golden Seed — permanent, build-agnostic" | Nothing |
| 3 | Church of Elleh — Kalé | "Buy Crafting Kit + Torch (500 runes, mandatory)" | Checkbox: "Talk to Kalé" |
| 4 | Gatefront — 3 weapons found | "LGS best but needs 16 STR. 1 point in STR unlocks two-handing for +40% damage" | Equipment dropdown tracker |
| 5 | First level-up | "STR to 11, then VIG to 20" | Nothing |
| 6 | Affinity selection | "Heavy on LGS — best at your stats" | Manual calculator requiring hand-entered values |
| 7 | Upgrade stones | "Which weapon gets them? LGS Heavy — computed" | Nothing |
| 8 | Where to go next | "Limgrave Tunnels for smithing stones, bring Club for strike damage" | Checklist with geographic ordering |
| 9 | Runebear encounter | "Skip — mathematically impossible at your level" | Presented as current step |
| 10 | Darriwil evergaol | "Skip — 1,480 HP boss, come back at level 15+" | Presented as current step |

---

## DESIGN DECISIONS CONFIRMED BY PLAYTHROUGH

### DD35: Golden Seed is universal optimal keepsake
Permanent +1 flask charge, build-agnostic. No other keepsake provides lasting benefit. Tool should recommend for all classes.

### DD36: Crafting Kit + Torch are mandatory first purchases
Every class needs both. 500 runes at Kalé. Tool should flag at Church of Elleh for all classes.

### DD37: Wretch is NOT universally optimal class
Wretch is optimal only when target build is unknown or spans all stats broadly. For focused builds (pure STR, pure INT, etc.), specialized classes reach the target at lower total level due to lower stat waste in irrelevant stats. The tool should compute optimal class per archetype template.

### DD38: Weapon upgrade level dominates stat investment in early game
Going from +0 to +3 increases AR more than the next 10 stat points combined. The tool should prioritize upgrade path recommendations over stat allocation at low upgrade levels.

### DD39: Walkthrough steps need power-gate filtering
Steps should be suppressed or flagged when player's computed power level cannot viably complete them. The engine has the data (player AR, boss/enemy HP, damage thresholds) to compute this.

### DD40: Single recommendation over comparison tables
Player doesn't need 20 rows of options. They need one answer: "Do this. Here's why." Collapsible detail for those who want to see alternatives.

---

## V3.0 FILE STATE

File: Tarnished_Companion_v3.html
Lines: 4,609 (was 4,392 in v2)
New code: ~217 lines added (weapon analysis panel, stat advisor, level calc fix)
JS syntax: CLEAN
All engine functions: INTACT
React mount: INTACT

---

## WHAT V3.0 STILL NEEDS (from this session)

1. Character creation screen: class optimizer per archetype, keepsake recommendation, first purchases
2. Power-gated walkthrough: suppress/flag steps unviable at current power level
3. Replace renderBuilds with archetype-computed recommendations
4. "Where to go next" — highest-value destination computed from current state and next boss gate
5. Enemy resistance awareness in routing (miners resist slash, bring Club)
6. Stat point advisor should account for weapon requirement breakpoints (e.g., "1 point in STR unlocks two-handing LGS" is worth more than raw AR gain)
7. Fix Compare tab (hooks violation in renderCompare)
8. split_for_claude.js / merge_from_claude.js workflow for future dev sessions

*Session document | March 22, 2026*
