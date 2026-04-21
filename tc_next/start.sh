#!/usr/bin/env bash
# Tarnished's Companion — Unix launcher (macOS / Linux).
# Tries Python first, falls back to Node, errors clearly if neither.

set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v python3 >/dev/null 2>&1; then
    exec python3 "$HERE/start.py" "$@"
elif command -v python >/dev/null 2>&1; then
    exec python "$HERE/start.py" "$@"
elif command -v node >/dev/null 2>&1; then
    exec node "$HERE/start.js" "$@"
else
    echo
    echo "Tarnished's Companion requires either Python 3.7+ or Node.js."
    echo
    echo "  Python: https://www.python.org/downloads/"
    echo "  Node:   https://nodejs.org/en/download/"
    echo
    echo "After installing, re-run ./start.sh"
    exit 1
fi
