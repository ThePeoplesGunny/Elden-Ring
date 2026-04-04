# /session-start — State Verification

Run this at the beginning of every conversation to verify project state alignment before any work begins.

## Phase 1: INVESTIGATION — Gather and cross-reference state

Run all of these in parallel:

1. **Read project memory** — check MEMORY.md index and any relevant memory files
2. **Read CLAUDE.md** — extract Current State section (version, baseline file, lines, last task, next task)
3. **Read tarnished_companion_project.md** — extract BACKLOG (open items), FILE STRUCTURE (filename, line count), IMPLEMENTATION STATE (version header)
4. **Git status** — `git status` (uncommitted changes?), `git log --oneline -5` (recent commits)
5. **File verification** — `ls Tarnished_Companion_v*.html` (does the baseline file exist?), `wc -l < Tarnished_Companion_v*.html` (actual line count)

## PHASE BOUNDARY
Data gathered. Now cross-reference.

## Phase 2: INTERVENTION — Alignment checks

Check each of these. If ALL pass, report clean. If ANY fail, report the discrepancy and stop — do not proceed to work until resolved.

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

## Report format

```
SESSION START — <date>
Version: v<X.Y>
File: <filename> (<line_count> lines)
Last task: <backlog_id> — <summary>
Next task: <backlog_id> — <summary>
Open backlog: <count> bugs, <count> features, <count> enhancements
Alignment: CLEAN | <list discrepancies>
Uncommitted: NONE | <description>
```

If discrepancies found, list each with what the sources disagree on and recommend the fix. These are factual corrections — fix them per ALIMS (evidence-backed correction, don't ask). Then re-report with CLEAN status.
