# CLAUDE.md — Tarnished's Companion

## What this is

Single-file offline HTML application (~1.35MB, ~4,600 lines) for Elden Ring. React 18.2.0 UI + embedded datamined game data (2,764 weapons, 173 bosses, 1,679 walkthrough steps). Opens in any browser, runs offline, localStorage persistence.

Current baseline: **v3.1** (`Tarnished_Companion_v3.1.html`, 4,608 lines)

Full project spec: `tarnished_companion_project.md` — read this for engine functions, data counts, implementation state, and roadmap.

---

## File structure (v3.1)

| Section | Lines | Rule |
|---|---|---|
| HTML shell + CSS | 1–66 | |
| Script open | 68 | |
| **Inline JSON data** | **69–2003** | **~69% of file. DO NOT dump into context. Use targeted grep/sed.** |
| Engine functions | 2004–2392 | AR calc, damage model, optimizer, stat resolution |
| UI helpers | 2401–2706 | |
| Character system + gates | 2707–2857 | Region caps, boss readiness, whetstones, bells, tactical, archetypes |
| Stat calc helpers | 2880–2925 | |
| App core | 2926–3141 | Achievements, endings, categories |
| Quests | 3142–3227 | |
| UI primitives | 3228–3240 | |
| **App component** | **3241** | All useState hooks live here — nowhere else |
| State helpers + export/import | 3283–3330 | |
| React UI components | 3334–4135 | 16 render functions |
| Optimizer UI | 4134–4149 | |
| Mount + close | 4389–4392 | |

Line numbers shift after each edit. Re-check with `grep -n` when needed.

---

## How to work on this file

1. **Read targeted sections** — use `sed -n 'START,ENDp' file.html` or grep. Never cat the whole file.
2. **Make surgical edits** — target specific functions or blocks. Don't rewrite large sections.
3. **Verify after edits:**
   ```bash
   echo "LINES: $(wc -l < Tarnished_Companion_v3.1.html)" && \
   tail -3 Tarnished_Companion_v3.1.html
   ```
4. **Syntax check JS sections** with `sed -n 'START,ENDp' file | node --check`
5. **Update `tarnished_companion_project.md`** after every delivery — new line count, shifted ranges, version number.

---

## Governing principles

- **No claims without computation.** Every recommendation is computed from datamined data. Narrative is not logic.
- **The tool calculates. The player decides.**
- **The boss is a resistance filter.** The journey is the power accumulation between gates.
- **Optimize by region, not by boss.**
- **Weapon availability = constraints, not item tracking.** Stats + unlocked affinities + upgrade cap determine viable weapons.
- **Cookbooks are NOT progression gates.** All tactical needs have non-craft alternatives. Decision final.
- **Single-file offline architecture.** Do not suggest migration to multi-file, server-based, or framework builds.

---

## Design decisions (locked)

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

---

## React rules

- All `useState` hooks live in the `App` component (line ~3241). Do not add hooks elsewhere.
- Compare tab has a pre-existing hooks violation — fix is on the roadmap, don't make it worse.
- Tech stack: React 18.2.0 via unpkg CDN, no build tools, no JSX transform (uses `React.createElement` or htm).

---

## Version numbering

- Minor versions 1–99: v3.1, v3.2, ... v3.99
- Version displayed in tool header as "COMPANION v[X.Y]"
- Hardcoded in the header string — find and replace on each delivery

---

## What NOT to do

- Do not load lines 69–2003 into context (that's the inline JSON data block)
- Do not suggest migrating away from single-file HTML
- Do not add React hooks outside the App component
- Do not make claims about weapon quality or build viability without engine computation
- Do not treat cookbooks as progression gates
- Do not rewrite working functions — make targeted edits
- Do not ask the user to test intermediate pieces — deliver complete, verified work
