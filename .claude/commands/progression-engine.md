# Progression Engine Agent

Analyze archetype progression through the game's regional checkpoints. This agent serves F2 (power-gated walkthrough), F3 (where to go next), and F7 (per-archetype weapon curves).

## Domain

The game is a sequence of regions, each ending with a mandatory boss gate. At each regional checkpoint, the player's state is defined by:
- **Archetype** (stat template): determines stat distribution at any level
- **Level**: determines total stat points allocated via archetype template
- **Region**: determines upgrade cap, available affinities (whetstones), and weapon pool
- **Boss gate**: the mandatory boss whose resistance profile tests the player's damage portfolio

The engine computes effective damage through boss resistance profiles. This agent uses that engine to map the full power trajectory for any archetype.

## Required context (read before analysis)

From `tarnished_companion_project.md`:
- ENGINE FUNCTIONS table (function names, line numbers, purposes)
- ENGINE DATA table (data counts and sources)
- FILE STRUCTURE table (where to find what)

From the HTML file (targeted reads only — NEVER load lines 69-2003):
- `STAT_TEMPLATES` — archetype definitions (grep for exact location)
- `REGION_CAPS` — upgrade caps per region (grep for exact location)
- `MANDATORY_BOSSES` — the boss sequence (grep for exact location)
- `GATE_WHETSTONES` / `GATE_BELL_BEARINGS` — progression gates
- `resolveStats()` — how archetype + level → stats
- `bestWeaponForBoss()` — how optimal weapon is selected given player state
- `deriveGateState()` — how journey checkoffs → gate unlocks

## Analysis protocol (Universal Evaluation Protocol)

For each archetype being analyzed:

### 1. TARGET
What is the optimal weapon + affinity at each regional checkpoint for this archetype?

### 2. CURRENT
At each checkpoint, compute:
- Player stats via `resolveStats(class, template, level)` where level is the expected level for that region
- Available affinities via gate state (which whetstones are obtainable by this region)
- Upgrade cap via `REGION_CAPS[region]`
- Available weapon pool (weapons obtainable by this point in the walkthrough)
- Top weapon(s) via `bestWeaponForBoss(boss, stats, gateState, region, twoHand)`

### 3. GAP
Where does the archetype's damage fall below boss readiness thresholds? These are the stress points — regions where the archetype's primary damage type is resisted and mitigation is needed.

### 4. ASSESSMENT
- **Weapon transitions**: When should the player switch weapons? What triggers the switch (new weapon available, new affinity unlocked, upgrade cap increase)?
- **Affinity transitions**: When does a new whetstone unlock a better affinity for this archetype?
- **Stat breakpoints**: Where does +1 in a stat unlock a new weapon or cross a soft cap?
- **Mitigation needs**: At stress points, what's the cheapest fix — different weapon, consumable, different affinity, or just more levels?

### 5. RECOMMENDATION
The progression curve: a sequence of (region, weapon, affinity, upgrade level, expected AR, effective damage vs boss, readiness status).

### 6. CONDITIONS
- Some weapons are gated behind optional content — flag if the optimal weapon requires going off the main path
- Two-handing changes stat requirements (1.5x STR) — note when this matters
- Ranged utility (bow/crossbow) needs may differ by archetype

### 7. PROVENANCE
For each recommendation: which engine function produced the number, against which boss, at what stat spread. Traceable back to data.

## Output format

```
ARCHETYPE: <name>
CLASS: Wretch (locked per DD37)

REGION: <region_name>
  Level: <expected_level> | Upgrade: +<cap>
  Stats: VIG <n> MND <n> END <n> STR <n> DEX <n> INT <n> FTH <n> ARC <n>
  Affinities: <unlocked list>
  Weapon: <name> (<affinity>) +<level>
  AR: <total> → Boss: <boss_name> → Effective: <dmg> (<hits to kill>)
  Status: READY | STRESS (<reason>)
  Transition: <why this weapon, what changed from last region>

STRESS POINTS:
  - <region>: <archetype> resisted by <boss> (<damage_type> negated at <pct>%)
    Mitigation: <option_1>, <option_2>

WEAPON CURVE SUMMARY:
  <region_1>: <weapon_1> → <region_2>: <weapon_2> → ... → <final_region>: <weapon_N>
```

## Constraints

- Never load the inline data block (lines 69-2003). Use grep to find specific data, or read engine functions that decode the data.
- All damage claims must come from engine computation paths, not from assertion.
- If a weapon appears optimal but requires optional content, flag it and provide the main-path alternative.
- Archetype analysis is independent per archetype — can be parallelized.
