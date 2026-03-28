# CLAUDE.md — Tarnished's Companion

## Workflow Protocol

This project uses a three-entity token ring. You (Claude Code) are the Technical Authority.

### Roles

**Command Authority (Gunny):** Approves all design decisions. Sets priorities. Accepts or rejects work. Carries the token between entities. Final say on everything.

**Operational Authority (Claude chat at claude.ai):** Maintains project history, design context, and state coherence across sessions. Researches game data. Drafts specs. Writes task instructions for you. Surfaces discrepancies between planned state and actual state — when operational authority flags a conflict, work stops until command resolves it. Does not direct you without command approval.

**Technical Authority (You — Claude Code):** Executes approved task instructions against the codebase. Makes implementation choices within scope (variable names, loop structure, code organization). Does NOT make design decisions, change scope, or skip steps. If a task instruction is ambiguous or you encounter something unexpected, STOP and ask Gunny.

### The Token Ring

State flows in one direction:

```
Chat (plan) → Gunny (approve) → You (execute) → Repo (state) → Gunny (verify) → Chat (debrief/next)
```

- The repo is the single source of truth.
- You read before you act. You write state when you finish.
- Gunny carries the token between you and chat. The ring does not complete without Gunny.
- If any entity detects a discrepancy in project state, the token stops until command resolves it.

### Task Execution Protocol

Every task you receive will follow this format:

```
TASK: [name]
SCOPE: [what to change]
FILES: [which files to read/edit]
READ FIRST: [specific line ranges or functions to examine]
CONSTRAINTS: [what NOT to do]
ACCEPTANCE: [how to verify it worked]
STATE UPDATE: [what to update in CLAUDE.md and project doc after completion]
```

**Your steps for every task:**

1. Read `CLAUDE.md` (automatic)
2. Read the specific file sections listed in READ FIRST
3. Check: does anything you see conflict with the task, the constraints, or the locked decisions below? If yes, STOP and report to Gunny.
4. Execute the changes
5. Run the verification listed in ACCEPTANCE
6. Update the Current State section of this file
7. Update `tarnished_companion_project.md` if the task says to
8. Commit and push: `v[X.Y]: [what changed]`
9. Report: what you did, what you verified, any issues or observations

**If anything is unclear:** STOP. Ask Gunny. Do not guess, do not improvise, do not make design decisions.

---

## Current State

**Version:** v3.1
**Baseline file:** `Tarnished_Companion_v3.1.html`
**Lines:** 4,608
**Last completed task:** (none under new protocol)
**Next task:** Awaiting instruction from command authority

---

## Project Architecture

Single-file offline HTML application. React 18.2.0 via unpkg CDN. localStorage persistence. No server dependency.

### File Structure (v3.1)

| Section | Lines | Notes |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline JSON data** | **69–2003** | **~69% of file bytes. Read with targeted grep/sed only.** |
| Engine functions | 2004–2392 | AR calc, damage model, optimizer, stat resolution |
| UI helpers | 2401–2706 | |
| Character system + gates | 2707–2857 | Region caps, boss readiness, whetstones, bells, tactical, archetypes |
| Stat calc helpers | 2880–2925 | |
| App core | 2926–3141 | Achievements, endings, categories |
| Quests | 3142–3227 | |
| UI primitives | 3228–3240 | |
| **App component** | **3241** | All useState hooks — nowhere else |
| State helpers + export/import | 3283–3330 | |
| React UI components | 3334–4135 | 16 render functions |
| Optimizer UI | 4134–4149 | |
| Mount + close | 4389–4392 | |

Line numbers shift after edits. Re-verify with `grep -n` when needed.

### Key Engine Functions

| Function | Purpose |
|---|---|
| `engDecodeW(enc)` | Decode weapon (all 26 upgrade levels) |
| `engDecodeWAtLevel(enc, level)` | Decode weapon (single level) |
| `engCalcAR(weapon, attrs, upg, 2h)` | Compute attack rating |
| `engDmgVsBoss(arResult, boss)` | AR through boss resistance → effective damage |
| `resolveStats(cls, tmpl, lvl)` | Class + archetype + level → effective stats |
| `bestWeaponForBoss(boss, stats, gate, region, 2h)` | Top 10 weapons for a boss given player state |
| `globalOptimize(lvl, bosses, tmpls, opts)` | Exhaustive class × template × weapon search |
| `deriveGateState(ci)` | Journey checkoffs → unlocked affinities + upgrade caps |

Full function reference with line numbers: see `tarnished_companion_project.md`

---

## Constraints

- **Never dump lines 69–2003 into context.** Use `sed -n 'START,ENDp'` or `grep` for targeted reads.
- **All useState hooks live in App component only.** Compare tab has a pre-existing hooks violation — do not add more.
- **Single-file architecture is final.** Do not suggest migration.
- **Cookbooks are NOT progression gates.** All tactical needs have non-craft alternatives. Decision final.
- **No claims without computation.** Every recommendation must be engine-computed from datamined data.
- **Version numbering:** Minor versions 1–99. Display as "COMPANION v[X.Y]" in header. Hardcoded string — find and replace.

---

## Locked Design Decisions

| ID | Decision |
|---|---|
| DD22 | Cookbooks not gates |
| DD34 | No claims without computation |
| DD35 | Golden Seed is universal optimal keepsake |
| DD36 | Crafting Kit + Torch mandatory first purchases ALL classes |
| DD37 | Wretch IS universally optimal class (zero stat waste: 10×8=80) |
| DD38 | Weapon upgrade level dominates stat investment early game |
| DD39 | Walkthrough steps need power-gate filtering |
| DD40 | Single recommendation over comparison tables |
