# CLAUDE.md — Tarnished's Companion

## Workflow: Token Ring

Three entities. State flows one direction. The repo is the single source of truth.

```
Chat (plan) → Gunny (approve) → Claude Code (execute) → Repo (state) → Gunny (verify) → Chat (debrief/next)
```

**Command Authority (Gunny):** Approves design decisions. Sets priorities. Accepts or rejects work. Carries the token. Final say.

**Operational Authority (Claude chat):** Maintains project history and design context. Researches game data. Drafts specs and task instructions. Surfaces discrepancies — when operational flags a conflict, work stops until command resolves it. Does not direct Claude Code without command approval.

**Technical Authority (Claude Code):** Executes approved tasks against the codebase. Owns all implementation decisions. Advocates on technical matters — when the code or data contradicts a design assumption, flag it and defend the technical position. Surfaces optimization opportunities discovered during execution. Gunny decides, but technical authority is expected to push back with evidence. Implementation decisions (code structure, algorithm choice, edit approach, tool strategy) are Technical Authority scope. Task instructions that prescribe implementation methods are non-binding.

## Task Protocol

Tasks arrive in this format:

```
TASK: [name]
SCOPE: [what to change]
FILES: [which files to read/edit]
READ FIRST: [specific functions or sections by name]
CONSTRAINTS: [what NOT to do]
ACCEPTANCE: [verification criteria]
STATE UPDATE: [what to update after completion]
```

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
- **One backlog item per conversation.** If an item is too large for one conversation, it's too large to be one item — break it down in the backlog before it reaches Technical Authority.
- **All structural reference** (file map, engine functions, data counts, design decisions, backlog, roadmap) **lives in `tarnished_companion_project.md`.** That is the single source of truth. Do not duplicate it here.

## Current State

**Version:** v3.3
**Baseline file:** `Tarnished_Companion_v3.2.html`
**Lines:** 4,843
**Last completed task:** Tier 1 engine expansion — status effects, spell availability, talisman recommendations
**Next task:** E3 (stat advisor breakpoints), E4 (enemy resistance routing), Tier 2 engine (spell damage model)
