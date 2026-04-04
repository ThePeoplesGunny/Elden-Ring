# /deliver — Delivery Close Checklist

Execute the delivery close checklist for a completed backlog item. This skill enforces the three-step close protocol from the project workflow.

## Required argument

$ARGUMENTS should contain: `<backlog_id> <version> <summary>`
Example: `/deliver F6 v3.2 dynamic weapon pool with async build and status indicator`

If $ARGUMENTS is empty, check git diff and recent work to infer the delivery context, then confirm with the user before proceeding.

## Phase 1: INVESTIGATION — Gather current state

Read these files to establish current state (do all reads in parallel):
1. `CLAUDE.md` — read the "Current State" section
2. `tarnished_companion_project.md` — read BACKLOG section, FILE STRUCTURE section, and IMPLEMENTATION STATE section
3. Run `git diff --stat` to see what changed
4. Run `wc -l < Tarnished_Companion_v*.html` to get current line count
5. Run `git log --oneline -3` to see recent commits

From these, identify:
- Current version string and what it needs to become
- Which backlog item(s) are being closed
- What line ranges shifted (compare FILE STRUCTURE table against actual file)
- What new functions or components were added

Report findings. If anything is ambiguous (e.g., version mismatch between files, backlog item unclear), stop and ask. This is a genuine decision point.

## PHASE BOUNDARY
Investigation complete. Switching to intervention.

## Phase 2: INTERVENTION — Execute the checklist

### Step 1: Update CLAUDE.md Current State
Edit the "Current State" section at the bottom of CLAUDE.md:
- **Version:** update to new version
- **Baseline file:** update filename if version changed
- **Lines:** update to actual line count from Phase 1
- **Last completed task:** set to `<backlog_id> — <summary>`
- **Next task:** preserve existing or update if the user specified

### Step 2: Update tarnished_companion_project.md
- **BACKLOG:** Change the target item's status to `[DONE v<X.Y> — <summary>]`
- **FILE STRUCTURE:** Re-verify line ranges for any sections that shifted. Update the table. Update the total line count in the header row.
- **IMPLEMENTATION STATE:** Add the delivery to "What's built and working" if it's a new capability. Update the version/line count header.
- **COMPLETED DELIVERIES:** Add an entry: `- **v<X.Y>:** <backlog_id> — <what changed>. Lines: <count>.`

### Step 3: Git commit
Stage the changed files and commit:
```
v<X.Y>: <backlog_id> — <summary>
```

Then push to remote immediately (per project protocol — no local-only accumulation).

## Phase 3: Verification

After commit, report:
- Version: what it was → what it is now
- Backlog item closed: ID and summary
- Line count: previous → current
- Files modified in this delivery
- Any discrepancies found and resolved during the process

If any step failed or produced unexpected results, report the failure — do not silently continue.
