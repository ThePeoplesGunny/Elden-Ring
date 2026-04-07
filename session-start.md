# /session-start — Project State Verification

Global §V handles the generic startup protocol. This command adds the Elden Ring-specific alignment checks.

## Project-Specific State Points

During Phase 1 (Load and Derive State) of global §V, verify these Elden Ring-specific items:

### Check 1: Filename alignment
Does the filename on disk match CLAUDE.md "Baseline file" AND the FILE STRUCTURE header in tarnished_companion_project.md?

### Check 2: Version alignment
Does CLAUDE.md "Version" match the version in tarnished_companion_project.md IMPLEMENTATION STATE header? Does the filename contain that version?

### Check 3: Line count alignment
Does the actual `wc -l` count match CLAUDE.md "Lines" AND the FILE STRUCTURE total? (Tolerance: +/- 5 lines for minor whitespace drift.)

### Check 4: Uncommitted changes
Are there uncommitted changes? If yes — what files? Are they work-in-progress from a prior session that didn't close properly?

### Check 5: Last task / next task coherence
Does CLAUDE.md "Last completed task" match the most recent backlog item marked DONE? Does "Next task" match what's PLANNED in the backlog?

### Check 6: Memory freshness
Are any memory files flagged as potentially stale? Do memory claims about project state match what the files actually show?

## Discrepancy Resolution

Discrepancies are factual corrections — fix them on authority of evidence, do not ask. Then re-report with CLEAN status and note what was corrected.
