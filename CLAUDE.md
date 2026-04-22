# CLAUDE.md — Tarnished's Companion

## Project-Specific Delivery Close

Every delivery updates these three artifacts (per global §VI.5):

1. **CLAUDE.md Current State** — version, baseline file, lines, last task, next task
2. **tarnished_companion_project.md** — backlog item status → DONE v[X.Y], file structure line ranges re-verified, new functions/components documented
3. **Git commit:** `v[X.Y]: [backlog ID] — [what changed]` — push to remote immediately

## Operating Rules

- **Portable local-first architecture.** Project runs entirely on the player's machine with no external dependencies at runtime. Small embedded stacks (SQLite, a minimal local file-server, Leaflet + static tiles) are acceptable when they meaningfully improve maintainability or capability. Criteria:
  - Portable: runs from a folder, no install beyond common runtimes (Node OR Python OR Go — default to what's already present)
  - Low maintenance: single-command startup, clear dependency list, ideally zero npm/pip packages
  - Offline: no cloud, no external APIs at runtime
  - Cross-platform: Windows / Mac / Linux
  - CD-sized upper bound: entire portable bundle ≤ ~700MB
- **Legacy constraint (transitional):** `Tarnished_Companion_v3.9.html` inline JSON block (lines 69–2003) — never load into context; use grep/sed. This constraint becomes moot once data migrates to external `data/*.json` / SQLite files during the architecture rewrite.
- **All useState hooks live in App component only.** Pre-existing violation in Compare tab — do not add more.
- **One backlog item per conversation** (flexible when items are interconnected — Gunny may direct multiple items per session).
- **All structural reference** (file map, engine functions, data counts, design decisions, backlog, roadmap) **lives in `tarnished_companion_project.md`.** That is the single source of truth. Do not duplicate it here.

## Current State

**Version:** v4.0.0-alpha (Phase B.1 weapons + B.2 talismans + B.3 armors ingested)
**Baseline:** `tc_next/` portable bundle (legacy `Tarnished_Companion_v3.9.html` preserved)
**Legacy lines:** 5,893
**Last completed task:** Phase B.3 — armors ingestion. `data/armors.json` canonical: 570 armor pieces (566 Kaggle + 4 Verdigris engine-stubs). Source is Kaggle CSV (deliton has no armors). No Fextralife armor harvest exists, so acquisition: null on all 570 rows. Engine overlay (19 sets × ~4 pieces = 71 pieces) applied for setName/setTier/enginePoise. 2 duplicate Kaggle rows dropped. 4 case-only name normalizations. **Dirty Kaggle data recovered via positional assignment** — 18 dmgNegation slot-names + 4 resistance slot-names were corrupted (StrEldenike, 6.1, Mag, Physical, Str, VS, Fire:, Light, Pose, Death, Vitality26, etc.) but array order is canonical [phy/strike/slash/pierce/magic/fire/ligt/holy] × [immunity/robustness/focus/vitality/poise]. Validation flagged 52 poise drifts + 58 weight drifts between Kaggle and engine — looks like data captured at different game patches; arbitration pending Fextralife harvest. Slot distribution: 166 head + 204 chest + 95 arms + 105 legs.
**Next task:** Phase B.4 — remaining item classes (AoW 90, spirits 64, sorceries 71, incantations 98, items 462). Generalize B.3 pattern: Kaggle-primary for classes deliton lacks, engine overlay where curated subsets exist. **Parallel work that would accelerate everything:** launch Fextralife harvest sub-agents for weapons (56→306), talismans (21→98), and first-ever armor harvest. Each harvest batch enables downstream validation and arbitrates drift cases.
**Playtest checkpoint:** L41 Wretch Pure STR committed. Morning Star +3 equipped (targeting +6). Engine v3.15-calibrated. Live playthrough paused while rewrite phases land; resume R4 Limgrave cleanup once tc_next journey view ships.
