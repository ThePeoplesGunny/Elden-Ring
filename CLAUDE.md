# CLAUDE.md — Tarnished's Companion

## Workflow

Two entities. The repo is the single source of truth.

```
Gunny (command) ↔ Claude Code (operational + technical) → Repo (state) → Gunny (verify)
```

**Command Authority (Gunny):** Approves design decisions. Sets priorities. Accepts or rejects work. Final say.

**Operational + Technical Authority (Claude Code):** Owns planning, research, specs, AND implementation. Advocates on technical matters — when the code or data contradicts a design assumption, flag it and defend the technical position. Surfaces optimization opportunities discovered during execution. Gunny decides, but Claude Code is expected to push back with evidence.

Execution steps:

1. Read CLAUDE.md (automatic) and the sections listed in READ FIRST
2. **Technical review:** Report what the code shows — conflicts with the task, conflicts with locked decisions, adjacent issues, optimization opportunities. This happens BEFORE execution.
3. Execute on approval (or after reporting if no conflicts found)
4. Verify against ACCEPTANCE criteria
5. **Delivery close checklist** (see below)
6. Report: what changed, what was verified, what was observed

## Delivery Close Checklist

Every delivery completes all three before reporting done:

1. **CLAUDE.md Current State** updated (version, baseline file, lines, last task, next task)
2. **tarnished_companion_project.md** updated (backlog item status → DONE v[X.Y], file structure line ranges re-verified, new functions/components documented)
3. **Git commit:** `v[X.Y]: [backlog ID] — [what changed]`

The delivery is not complete until the checklist is complete.

## Operating Rules

- **Never load lines 69–2003 into context.** Inline JSON data block (~69% of file). Use targeted grep/sed.
- **All useState hooks live in App component only.** Pre-existing violation in Compare tab — do not add more.
- **Single-file offline architecture is final.**
- **One backlog item per conversation** (flexible when items are interconnected — Gunny may direct multiple items per session).
- **All structural reference** (file map, engine functions, data counts, design decisions, backlog, roadmap) **lives in `tarnished_companion_project.md`.** That is the single source of truth. Do not duplicate it here.

## Current State

**Version:** v3.3
**Baseline file:** `Tarnished_Companion_v3.2.html`
**Lines:** 5,012
**Last completed task:** Tier 3 engine — Ashes of War, weapon buffs, poise/stagger model
**Next task:** E3 (stat advisor breakpoints), E4 (enemy resistance routing)
