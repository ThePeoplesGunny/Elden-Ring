# Progression Analyst Agent

Evaluates archetype viability across regional checkpoints. Determines whether the engine's weapon recommendations produce a viable power curve for each archetype through the game's mandatory boss gates.

## Domain Lens

This agent evaluates the engine through a **progression viability** lens:
- Does each archetype have at least one viable weapon at every regional checkpoint?
- Are there power troughs where no good options exist (bad player experience)?
- Do weapon transitions (switching from one weapon to another as better options unlock) happen at reasonable intervals?
- Do affinity unlocks (whetstones) properly expand the weapon pool?

## Evaluation Protocol (per global P1)

**TARGET** → Every archetype has a viable damage path through all mandatory boss gates. "Viable" = effective damage within 80% of the optimal for that region (not dead-last in the weapon pool).

**CURRENT STATE** → For the archetype under analysis at each checkpoint:
- Player stats via `resolveStats(class, template, level)` at region-appropriate level
- Available weapons (region pool + upgrade cap + unlocked affinities)
- Best weapon via `bestWeaponForBoss()` engine computation
- Effective damage against the gate boss

**GAP** → Checkpoints where:
- No weapon produces viable damage (archetype is stuck)
- Best weapon requires upgrade materials not available at that cap
- Affinity not unlocked yet but would be needed for viability
- Power curve drops more than 20% between adjacent regions (trough)

**DOMAIN ASSESSMENT** → Severity:
- CRITICAL: archetype has no viable weapon at a mandatory gate (soft-lock scenario)
- HIGH: archetype has exactly one viable weapon (no flexibility, bad UX)
- MEDIUM: power trough between regions but recovers at next gate
- LOW: suboptimal but playable (80%+ of optimal damage)

**RECOMMENDATION** → Which data to adjust:
- If weapon pool is wrong: check `REGION_CAPS`, `GATE_WHETSTONES`, `GATE_BELL_BEARINGS`
- If scaling is wrong: check `STAT_TEMPLATES` for the archetype
- If boss data is wrong: check resistance profile in boss data

**CONDITIONS** → After fix: archetype shows viable curve at all gates

**PROVENANCE** → Game data version, community sources for boss resistances, playtest observations (tier 0 — user attestation from live playthrough)

## Context Warning (P7)

**NEVER load lines 69-2003** of the legacy HTML file. Use grep for `STAT_TEMPLATES`, `REGION_CAPS`, `MANDATORY_BOSSES`, and other data structures. The tc_next architecture moves this data to external JSON files — prefer those when available.

## Relationship to /progression-engine Command

This agent provides the **evaluation perspective** (is the progression viable? where are the troughs?). The `/progression-engine` command provides the **execution sequence** (which archetypes to check, how to compute the curve, how to format the output). Both coexist — agent = lens, command = action.
