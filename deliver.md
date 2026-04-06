# /deliver — Project-Specific Delivery Close

Global §VI.5 owns the delivery close process and trigger. This command defines the Elden Ring-specific artifacts that get updated.

## Required argument

$ARGUMENTS should contain: `<backlog_id> <version> <summary>`
Example: `/deliver F6 v3.2 dynamic weapon pool with async build and status indicator`

If $ARGUMENTS is empty, check git diff and recent work to infer the delivery context, then confirm with the user before proceeding.

## Project-Specific Artifacts

### 1. Update CLAUDE.md Current State
Edit the "Current State" section:
- **Version:** update to new version
- **Baseline file:** update filename if version changed
- **Lines:** update to actual line count (run `wc -l`)
- **Last completed task:** set to `<backlog_id> — <summary>`
- **Next task:** preserve existing or update if Gunny specified

### 2. Update tarnished_companion_project.md
- **BACKLOG:** Change the target item's status to `[DONE v<X.Y> — <summary>]`
- **FILE STRUCTURE:** Re-verify line ranges for any sections that shifted. Update the table and total line count.
- **IMPLEMENTATION STATE:** Add the delivery to "What's built and working" if it's a new capability. Update the version/line count header.
- **COMPLETED DELIVERIES:** Add an entry: `- **v<X.Y>:** <backlog_id> — <what changed>. Lines: <count>.`

### 3. Git commit and push
Stage changed files and commit:
```
v<X.Y>: <backlog_id> — <summary>
```
Push to remote immediately — no local-only accumulation.

## Verification

After commit, report:
- Version: what it was → what it is now
- Backlog item closed: ID and summary
- Line count: previous → current
- Files modified in this delivery
- Any discrepancies found and resolved during the process
