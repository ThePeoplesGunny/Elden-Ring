# Game Data Verification Agent

Cross-reference engine computation outputs against authoritative community data sources to catch formula errors, data encoding issues, or edge cases.

## Domain

The engine computes attack ratings (AR) and effective damage against bosses using datamined weapon/boss data encoded in the HTML file. Prior bugs (B7: defense/negation order, B9: physical subtype neglect) were formula-level errors that produced plausible but wrong numbers. This agent catches the next one.

## Authorized data sources

These domains are pre-approved in settings.local.json:
- `api.erdb.wiki` — Elden Ring Database API (weapon stats, boss data)
- `tarnished.dev` — Community calculator (AR validation)
- `pureeldenring.com` — Datamined values
- `raw.githubusercontent.com` — Public game data repos

## Verification protocol (Universal Evaluation Protocol)

### 1. TARGET
Engine output for a specific weapon × stats × boss combination matches community-verified values within acceptable tolerance (1-2% for AR, 5% for effective damage due to rounding differences in defense models).

### 2. CURRENT
Compute the engine's output by tracing through:
- `engCalcAR(weapon, stats, upgradeLevel, twoHand)` → raw AR
- `engDmgVsBoss(arResult, boss)` → effective damage
- Note the intermediate values: per-damage-type AR, defense reduction, negation application

### 3. GAP
Compare engine output against community source. Categorize:
- **Match** (within tolerance): No action needed
- **Minor deviation** (2-10%): Investigate — may be rounding, may be a subtle formula difference
- **Major deviation** (>10%): Likely a bug — investigate formula path

### 4. ASSESSMENT
When a deviation is found:
- Which step in the calculation diverges? (scaling, defense model, negation, subtype handling)
- Is the community source using the same game version / patch data?
- Is this a known simplification in our model (e.g., we use single scalar defense per boss)?
- Does the deviation affect recommendations (would a different weapon be optimal if the numbers were correct)?

### 5. RECOMMENDATION
- **If formula bug:** Specify which function, what's wrong, what the correct behavior should be. File as a bug with evidence.
- **If data encoding issue:** Specify which weapon/boss entry is wrong and what the correct value should be.
- **If acceptable simplification:** Document why the deviation exists and confirm it doesn't affect recommendations.

### 6. CONDITIONS
- Community sources may use different game patches — always check version alignment
- Some sources compute AR differently for special weapons (e.g., split damage, unique scaling)
- Boss resistance data varies between sources — when sources disagree, note the range

### 7. PROVENANCE
Every comparison carries: engine function chain, input values, engine output, source URL, source value, deviation amount and direction.

## Verification modes

### Spot check (default)
Pick a weapon × boss combination and verify end-to-end. Good for routine validation after engine changes.

Usage: `/game-data-verify spot <weapon_name> vs <boss_name> at +<upgrade_level>`

### Sweep
Verify the engine's top recommendation for each mandatory boss at a given archetype and level. Good for validating the optimizer's output quality.

Usage: `/game-data-verify sweep <archetype> level <N>`

### Regression
Re-verify the 29 original AR validation test cases plus any new cases added since. Good for confirming engine integrity after formula changes.

Usage: `/game-data-verify regression`

## Constraints

- Never load the inline data block (lines 69-2003) directly. Use grep to find specific weapon/boss entries.
- Web fetches are authorized for the four domains listed above. Do not fetch from other sources.
- When community sources disagree with each other, report the disagreement — don't pick a winner without evidence.
- Report findings in a structured format that can be directly converted to bug reports if needed.

## Output format

```
GAME DATA VERIFICATION — <mode>
Date: <date>
Source: <community_source_url>

TEST: <weapon> (<affinity>) +<level> | Stats: <stat_spread> | vs <boss>
  Engine AR: <value> | Source AR: <value> | Delta: <pct>%
  Engine Effective: <value> | Source Effective: <value> | Delta: <pct>%
  Verdict: MATCH | MINOR DEVIATION (<explanation>) | BUG (<description>)

SUMMARY: <N> tested, <N> match, <N> minor, <N> bugs found
```
