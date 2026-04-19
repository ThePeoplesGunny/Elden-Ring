# Phase 0 Engine Calibration Sweep — All 8 Attributes

**Character state:** Gunny, L3 Wretch, Morning Star +3 equipped, 150K unspent runes, Fort Faroth SoG.
**Current stats:** VIG 10, MND 10, END 10, **STR 12**, DEX 10, INT 10, FAI 10, ARC 10 (L3 = base 80 + 2 STR).
**Pass criteria:** |Δ| ≤ 1 at every test point. Outliers flagged for engine investigation.
**Scope:** All 8 attributes. AR scaling for INT/FAI/ARC-scaling weapons deferred to **Phase 0.5** (minimal detours to acquire a staff/seal/arc weapon, deliberately out of scope here).

---

## Protocol

1. Sit at Fort Faroth SoG. Open **Level Up**.
2. For each test row below, allocate points in ONLY the tested attribute to reach the target value. All other attributes stay at their current baseline (STR=12 already, everything else=10).
3. **Read** the preview values on the left panel (HP/FP/Stamina/Equip Load), on the Stats tab (Discovery, Immunity/Robustness/Focus/Vitality/Poise, the 8 defenses), and on the Equipment tab (Morning Star AR and Bleed buildup).
4. **Back out** (press Cancel, do NOT confirm) so the runes are not spent.
5. Record in the **In-game** column. Compute Δ = in-game − engine.
6. Repeat for the next test row.
7. After all attributes are swept, bring the completed sheet back for analysis.

**Do not confirm any allocation until the sweep is complete and the final chosen allocation is decided — this is calibration, not commitment.**

---

## 1. VIG sweep — HP

| VIG | Engine HP | In-game HP | Δ |
| --- | --- | --- | --- |
| 10  | 415       | 414        | -1 |
| 25  | 800       | 800        | 0  |
| 40  | 1450      | 1450       | 0  |
| 60  | 1900      | (rune-budget short) | — |

Also record at each test point: **Immunity**, **Fire Defense** (engine does not predict — raw capture).

| VIG | In-game Immunity | In-game Fire Def |
| --- | ---------------- | ---------------- |
| 10  |  91              | 79               |
| 25  |  94              | 95               |
| 40  |  127             | 124              |
| 60  |                  |                  |

---

## 2. MND sweep — FP

| MND | Engine FP | In-game FP | Δ |
| --- | --------- | ---------- | - |
| 10  | 68        | 78         | **+10** ❌ |
| 25  | 146       | 147        | +1  |
| 40  | 248       | 235        | **-13** ❌ |
| 55  | 330       | (rune-budget short) | — |

Also record: **Focus**.

| MND | In-game Focus |
| --- | ------------- |
| 10  | 91            |
| 25  | 94            |
| 40  | 127           |
| 55  |               |

---

## 3. END sweep — Stamina + Equip Load

| END | Engine Stam | In-game Stam | Δ Stam | Engine EquipLoad | In-game EquipLoad | Δ EL |
| --- | ----------- | ------------ | ------ | ---------------- | ----------------- | ---- |
| 10  | 96          | 96           | 0      | 48.8             | 48.2              | -0.6  |
| 20  | 113         | 113          | 0      | 65.8             | 64.1              | **-1.7** ❌ |
| 30  | 130         | 130          | 0      | 78.9             | 77.6              | **-1.3** ❌ |
| 50  | 155         | (rune-budget short) | — | 106.3     | (rune-budget short) | —  |

Also record: **Robustness**, **Physical Defense**.

| END | In-game Robustness | In-game Phys Def |
| --- | ------------------ | ---------------- |
| 10  | 91                 | 76               |
| 20  | 93                 | 80               |
| 30  | 95                 | 84               |
| 50  |                    |                  |

---

## 4. STR sweep — Morning Star +3 AR (DEX/INT/FAI/ARC held at 10)

| STR | 1H Engine Phys AR | In-game 1H AR | Δ | 2H Engine Phys AR | In-game 2H AR | Δ |
| --- | ----------------- | ------------- | - | ----------------- | ------------- | - |
| 12  | 155               | 155           | 0 | 162               | 162           | 0 |
| 20  | 164               | 164           | 0 | 173               | 173           | 0 |
| 55  | 193               | (rune-budget short) | — | 207         | (rune-budget short) | — |
| 80  | 206               | (rune-budget short) | — | 214         | (rune-budget short) | — |

Also record: **Physical Defense** at each STR test point (engine does not predict).

| STR | In-game Phys Def |
| --- | ---------------- |
| 12  | 76               |
| 20  | 82               |
| 55  |                  |
| 80  |                  |

---

## 5. DEX sweep — Morning Star +3 AR (STR at 12, INT/FAI/ARC at 10)

| DEX | 1H Engine Phys AR | In-game 1H AR | Δ | Engine Bleed | In-game Bleed | Δ |
| --- | ----------------- | ------------- | - | ------------ | ------------- | - |
| 10  | 155               | 155           | 0 | 52           | n/a (weapon-derived, not stat-derived) | — |
| 20  | 163               | 163           | 0 | 52           | n/a | — |
| 55  | 187               | (rune-budget short) | — | 52     | n/a | — |
| 80  | 197               | (rune-budget short) | — | 52     | n/a | — |

Also record: **Robustness**.

| DEX | In-game Robustness |
| --- | ------------------ |
| 10  | 91                 |
| 20  | 93                 |
| 55  |                    |
| 80  |                    |

---

## 6. INT null scan — Morning Star has NO INT scaling (expect Δ = 0)

| INT | 1H Engine Phys AR | In-game 1H AR | Δ (expect 0) |
| --- | ----------------- | ------------- | ------------ |
| 10  | 155               | 155           | 0            |
| 20  | 155               | 155           | 0            |
| 50  | 155               | (rune-budget short) | — |
| 80  | 155               | (rune-budget short) | — |

Also record: **Magic Defense**, **Vitality**.

| INT | In-game Magic Def | In-game Vitality |
| --- | ----------------- | ---------------- |
| 10  | 92                | 101              |
| 20  | 116               | 103              |
| 50  |                   |                  |
| 80  |                   |                  |

---

## 7. FAI null scan — Morning Star has NO FAI scaling (expect Δ = 0)

| FAI | 1H Engine Phys AR | In-game 1H AR | Δ (expect 0) |
| --- | ----------------- | ------------- | ------------ |
| 10  | 155               | 155           | 0            |
| 20  | 155               | 155           | 0            |
| 50  | 155               | (rune-budget short) | — |
| 80  | 155               | (rune-budget short) | — |

Also record: **Fire Def**, **Holy Def**, **Lightning Def**, **Vitality**, **Focus**.

| FAI | Fire Def | Holy Def | Lightning Def | Vitality | Focus |
| --- | -------- | -------- | ------------- | -------- | ----- |
| 10  | 79       | 92       | 72            | 101      | 91    |
| 20  | 83       | 96       | 76            | 103      | 93    |
| 50  |          |          |               |          |       |
| 80  |          |          |               |          |       |

---

## 8. ARC sweep — Discovery + Morning Star bleed null scan

| ARC | Engine Discovery | In-game Discovery | Δ | Engine MS Bleed | In-game MS Bleed | Δ |
| --- | ---------------- | ----------------- | - | --------------- | ---------------- | - |
| 10  | 109              | 110               | +1 | 52             | n/a (weapon-derived) | — |
| 20  | 119              | 120               | +1 | 52             | n/a | — |
| 55  | 154              | (rune-budget short) | — | 52           | n/a | — |
| 80  | 179              | (rune-budget short) | — | 52           | n/a | — |

**Key question on bleed**: engine predicts flat 52 across ARC sweep — meaning standard Morning Star (a=0) does not scale bleed with ARC. If in-game bleed *does* climb with ARC, that's a real discrepancy and we dig in. If it holds flat, it confirms ARC scaling for status requires a blood-affinity infusion (which Gunny doesn't have at +3 standard).

Also record: **Immunity**, **Vitality**.

| ARC | In-game Immunity | In-game Vitality |
| --- | ---------------- | ---------------- |
| 10  | 91               | 101              |
| 20  | 93               | 111              |
| 55  |                  |                  |
| 80  |                  |                  |

---

## Unmodeled — gap ledger

The engine has NO prediction for the following. They are being **captured raw** in this sweep so we can decide whether to add engine coverage post-sweep:

- **8 Defenses**: Phys (Standard/Strike/Slash/Pierce), Magic, Fire, Lightning, Holy
- **4 Resistances**: Immunity, Robustness, Focus, Vitality
- **Poise** (player-side)
- **Cast speed** (DEX-derived, not on stat screen, affects sorcery/incantation speed)
- **Fall damage reduction** (DEX-derived)
- **Status buildup scaling grades** shown in-game as letter grades on weapons
- **Spell scaling coefficients** for equipped staff/seal (deferred to Phase 0.5)

For every attribute sweep above, record any of these that *changed* vs baseline in the secondary tables. If a value held flat across every test point of an attribute, note "FLAT" and skip per-row capture for that combination.

---

## Phase 0.5 — deferred AR scaling for INT/FAI/ARC weapons

After this sweep closes, Phase 0.5 acquires minimal test items:
- **Meteorite Staff** (Street of Sages Ruins, Caelid) — INT scaling verification
- **Finger Seal** (Roundtable Hold, cheap) — FAI scaling verification
- **Any ARC-scaling weapon in reach** (Uchigatana at Deathtouched Catacombs, or Reduvia at Murkwater Cave) — ARC scaling verification

Once those are equipped, we re-sweep INT/FAI/ARC to cover weapon-side scaling. That's Phase 0.5 scope — explicitly separate from this sweep.

---

## After the sweep

1. Compute Δ for every cell.
2. Any |Δ| > 1 → log as a calibration finding; engine fix or data fix to follow.
3. Flat rows matching `engine = in-game` across the whole attribute confirm that scaling path.
4. Unmodeled fields that show clean curves → candidates for engine coverage expansion in a future version.
5. **Then**, with the engine verified at realistic post-commit allocations, Gunny picks archetype and commits the 150K runes.

Script: `scripts/calibrate_sweep_v314.js` — re-run if any engine data changes between now and sweep execution.

---

## Findings (sweep executed 2026-04-19)

### PASS — engine matches in-game within |Δ| ≤ 1

| Path | Points tested | Result |
|------|---------------|--------|
| **VIG → HP** | 10 / 25 / 40 | Δ = −1 / 0 / 0 ✓ |
| **END → Stamina** | 10 / 20 / 30 | Δ = 0 / 0 / 0 ✓ (exact) |
| **STR → Morning Star AR (1H + 2H)** | 12 / 20 | Δ = 0 / 0 ✓ (exact, both 1H & 2H) |
| **DEX → Morning Star AR** | 10 / 20 | Δ = 0 / 0 ✓ (exact) |
| **INT null scan (MS has no INT scaling)** | 10 / 20 | Δ = 0 ✓ |
| **FAI null scan (MS has no FAI scaling)** | 10 / 20 | Δ = 0 ✓ |
| **ARC → Discovery** | 10 / 20 | Δ = +1 / +1 ✓ (consistent unit offset; tolerance met) |

B13 boundary-case note: at STR 12 (the Morning Star requirement threshold), current engine returns 155 and in-game shows 155 — no discrepancy. Prior v3.14 calibration had recorded 154 at this point; whichever path produced that was a one-off, not a current engine issue.

### FAIL — |Δ| > 1, real engine data bugs

**Bug #1: MND → FP lookup curve is wrong.**
- MND 10: engine 68 vs in-game **78** (Δ +10)
- MND 25: engine 146 vs in-game 147 (Δ +1, within tolerance)
- MND 40: engine 248 vs in-game **235** (Δ −13)

Not a flat offset — the shape of the curve is wrong. Engine under-predicts at low MND, crosses correct at ~MND 25, over-predicts at MND 40. Points to a bad soft-cap inflection in `ENG_DATA.derivedStats.fp.values`. Source needs re-derivation from Fextralife or an authoritative datamine.

**Bug #2: END → Equip Load lookup is biased high.**
- END 10: engine 48.8 vs in-game 48.2 (Δ −0.6)
- END 20: engine 65.8 vs in-game **64.1** (Δ −1.7)
- END 30: engine 78.9 vs in-game **77.6** (Δ −1.3)

Engine consistently over-predicts Equip Load by ~1–2. Stamina matches exactly at all 3 tested END values — so the bug is isolated to `ENG_DATA.derivedStats.equipLoad.values`, not a shared issue with Stamina.

### Rune-budget short rows
L50/55/60/80 test points deferred — previewing those allocations requires a rune budget the live character doesn't have. These revisit post-commit or post-farm, and only if a sweep is still needed at that range (the lower-range coverage already validates the curve shape for the passing paths).

### Bleed not stat-derived (Gunny confirm)
The ARC sweep's "bleed buildup" columns collapsed — bleed buildup on a standard (a=0) weapon is fixed by weapon+upgrade level, not by any attribute. Engine's flat 52 across all ARC values was correct; the in-game reads simply wouldn't have varied, so those columns are marked n/a. **Corollary**: ARC scaling of bleed requires a Blood affinity infusion, not raw attribute investment. This is a lock on archetype implications — pure ARC without a blood-affinity weapon buys discovery + resistances + minor weapon AR on ARC-scaling weapons only, not status buildup on a standard Morning Star.

### Unmodeled field observations (all raw capture — candidates for engine expansion)
- **VIG → Immunity, Fire Defense**: 91→94→127, 79→95→124 across VIG 10/25/40. Big jump between 25 and 40.
- **MND → Focus**: 91→94→127 — mirror of VIG→Immunity shape. Shared resistance curve likely.
- **END → Robustness + Phys Def**: 91→93→95, 76→80→84. Modest steady gains.
- **STR → Phys Def**: 76 at STR 12 → 82 at STR 20. Real STR→Phys Def contribution.
- **DEX → Robustness**: 91→93. Shared curve with END→Robustness.
- **INT → Magic Def + Vitality**: 92→116 (big Magic Def jump), 101→103.
- **FAI → Fire/Holy/Lightning Def + Vitality + Focus**: all shift by +2–4 across FAI 10→20.
- **ARC → Immunity + Vitality**: 91→93, and **Vitality 101→111** — essentially 1:1 per ARC point. Worth flagging; ARC's contribution to Vitality is larger than the engine likely assumes anywhere it uses Vitality downstream.

### Next actions (pending Gunny approval)
1. File **B14 (MND→FP lookup table wrong)** and **B15 (END→EquipLoad lookup biased high)** into `tarnished_companion_project.md` backlog. Fix = re-derive both lookup tables from Fextralife, or use Gunny's in-game data points as ground-truth anchors and regenerate the curve between them.
2. Archetype decision still deferred until the two failing paths are either fixed or confirmed non-load-bearing for archetype math. STR/DEX AR is the load-bearing path for melee archetype commitment, and that path is **verified exact**. MND/FP matters for caster archetypes; EL matters for armor-heavy builds. If commitment skews melee, the failing paths are lower-priority for immediate fix.
3. Phase 0.5 weapon-side INT/FAI/ARC scaling verification — still queued, only executes after archetype commit & acquisition detour plan.

