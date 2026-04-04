# /verify — Post-Edit Validation

Run this after any edit batch to validate file integrity and project constraints.

## Required argument

$ARGUMENTS may contain a version string (e.g., `v3.2`) or feature identifier to grep for. If empty, infer from CLAUDE.md Current State.

## Checks (run all in parallel where possible)

### 1. File integrity
```bash
wc -l < Tarnished_Companion_v*.html
```
Report line count. Compare against CLAUDE.md "Lines" value — if they differ, this is expected after edits but must be updated at delivery.

### 2. Syntax check
```bash
# Extract the script content and check syntax
sed -n '68,$ p' Tarnished_Companion_v*.html | sed 's/<\/script>//' | sed 's/<\/div>//' | sed 's/<\/body>//' | sed 's/<\/html>//' | node --check 2>&1
```
If syntax check fails, report the error with line context. This is a blocker — do not proceed.

### 3. Data block integrity
```bash
# Verify the inline data block boundaries haven't shifted
sed -n '68,69p' Tarnished_Companion_v*.html
sed -n '2003,2005p' Tarnished_Companion_v*.html
```
Line 68 should be `<script>` or similar script open. Lines 2003-2004 should be the end of inline data / start of engine constants. If these boundaries shifted, flag immediately — the "never load 69-2003" rule depends on them.

### 4. Hooks compliance
```bash
# Check for useState outside App component (the known violation is renderCompare)
grep -n 'useState' Tarnished_Companion_v*.html | head -30
```
All useState calls should be inside the App component (line ~3281+), except the known pre-existing violation in renderCompare (line ~2441). Any NEW useState outside App is a blocker.

### 5. Feature verification
If a feature identifier was provided in $ARGUMENTS or is known from context:
```bash
grep -c '<feature_identifier>' Tarnished_Companion_v*.html
```
Confirm the feature exists in the file. If count is 0, the edit didn't land.

### 6. Structure check
```bash
tail -5 Tarnished_Companion_v*.html
```
File must end with `</script>`, `</body>`, `</html>` (or equivalent closing tags). If the tail looks wrong, the file is truncated or corrupted.

### 7. Version string check
```bash
grep -n 'COMPANION v' Tarnished_Companion_v*.html | head -5
```
The version string in the UI header should match the expected version. Flag if stale.

## Report format

```
VERIFY — <filename>
Lines: <count>
Syntax: PASS | FAIL (<error>)
Data block: INTACT (69-2003) | SHIFTED (<new boundaries>)
Hooks: CLEAN | VIOLATION (<location>)
Feature: PRESENT (<count> occurrences) | MISSING
Structure: INTACT | CORRUPTED (<issue>)
Version: <displayed version> | STALE (<expected>)
```

If all PASS: one-line summary. If any FAIL: list failures with remediation guidance.
