#!/bin/bash
# phantom-shots.sh <out-dir> — screenshot Chapter Three's story moments (see woods-shots.sh).
G="${GODOT:-/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot}"
OUT="${1:?usage: phantom-shots.sh <out-dir>}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
cd "$(dirname "$0")/.."
shot() { # name frames args...
 local name=$1 frames=$2; shift 2
 "$G" --path . -- --chapter 3 "$@" --capture "$OUT/$name.png" --capture-after "$frames" >"$OUT/$name.log" 2>&1 &
 local pid=$!
 for i in $(seq 1 600); do kill -0 $pid 2>/dev/null || break; sleep 0.5; done
 kill $pid 2>/dev/null
 if grep -qE "SCRIPT ERROR|Parse Error" "$OUT/$name.log"; then echo "FAIL $name"; grep -E "SCRIPT ERROR|Parse Error" "$OUT/$name.log" | head -3
 elif [ -f "$OUT/$name.png" ]; then echo "ok   $name"; else echo "MISS $name (no image)"; fi
}
shot 01-title        60
shot 02-mission      200  --tour
shot 03-phantom      520  --tour
shot 04-target       840  --tour
shot 05-tail         1150 --tour
shot 06-clue-phone   1760 --tour
shot 07-clue-coffee  2660 --tour
shot 08-brute        5750 --tour
shot 09-handoff      6560 --tour
shot 10-back-window  7560 --tour
shot 11-drive        260  --from workshop-wrong-first-turn
shot 12-secret       100  --from cl3-secret-e2 --place 230 20
shot 13-sunday       1500 --reference workshop-return-launch --chain
