# Tarnished's Companion — portable bundle

A journey-aware Elden Ring progression planner. Runs entirely on your machine. No internet required at runtime, no accounts, no telemetry.

## Quick start

**Windows:** double-click `start.bat`
**macOS / Linux:** `./start.sh`

Either will detect Python or Node on your system, start a local static server, and open the app in your browser at `http://127.0.0.1:8000/`.

**Requirements:** Python 3.7+ OR Node.js 14+. Most dev machines already have one.

## Structure

```
tc_next/
├── index.html            # app shell
├── app/                  # UI (React via createElement, no build step)
│   ├── main.js
│   ├── views/            # one file per view
│   └── components/       # shared UI pieces
├── engine/               # pure computation, no UI deps
│   ├── ar.js             # attack rating / scaling math
│   ├── damage.js         # damage vs boss, defense curves, status
│   ├── stats.js          # HP / FP / Stamina / Equip Load / Discovery
│   ├── rune_cost.js      # level cost formula (Fextralife-authoritative)
│   ├── optimizer.js      # stat allocator, bestWeaponForBoss
│   └── archetype.js      # 13 archetype templates + transition logic
├── data/                 # item / boss / location database (JSON)
├── assets/
│   ├── maps/             # regional map images
│   └── items/            # item icons (mirrored from deliton CDN)
├── legacy/               # archived Tarnished_Companion_v3.9.html for reference
├── start.py              # Python launcher
├── start.js              # Node fallback
├── start.bat             # Windows dispatcher
└── start.sh              # Unix dispatcher
```

## Attribution

- Game data: deliton/eldenring-api (CC license) + Fextralife wiki + FromSoftware Elden Ring (data mined for community research only)
- Engine math: verified against Fextralife formulas + in-game readouts

## Status

Under active rewrite from the legacy monolithic HTML. See `../REWRITE_PLAN.md` in the project root for phasing.
