#!/bin/bash
# sweep.sh <out-dir> <every> <quit-after> [game flags...]
# Play the game with the given flags, save a frame every <every> ticks until <quit-after>, then build
# labelled contact sheets (sheet-01.png, ...; 12 frames each) for reviewing a whole chapter at once.
#   tools/sweep.sh shots/sweep-ch3 120 7900 --chapter 3 --tour --report
G="${GODOT:-/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot}"
OUT="${1:?usage: sweep.sh <out-dir> <every> <quit-after> [flags...]}"; EVERY="${2:?every}"; QUIT="${3:?quit-after}"; shift 3
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"; rm -f "$OUT"/*.png
cd "$(dirname "$0")/.."
"$G" --path . -- "$@" --sweep "$OUT" --sweep-every "$EVERY" --quit-after "$QUIT" >"$OUT/run.log" 2>&1
grep -E "SCRIPT ERROR|Parse Error" "$OUT/run.log" | head -5
grep -E "QUIT-AFTER" "$OUT/run.log"
python3 "$(dirname "$0")/contact-sheet.py" "$OUT"
