#!/bin/bash
# felix-shots.sh <out-dir> — screenshot every Chapter One spot an art change can touch.
# Each shot launches the game, waits a number of frames, saves a PNG and quits (40 s cap).
# Compare a "before" folder with an "after" folder by eye.
G="${GODOT:-/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot}"
OUT="${1:?usage: felix-shots.sh <out-dir>}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
cd "$(dirname "$0")/.."
shot() { # name frames args...
 local name=$1 frames=$2; shift 2
 "$G" --path . -- "$@" --capture "$OUT/$name.png" --capture-after "$frames" >"$OUT/$name.log" 2>&1 &
 local pid=$!
 for i in $(seq 1 80); do kill -0 $pid 2>/dev/null || break; sleep 0.5; done
 kill $pid 2>/dev/null
 if grep -qE "SCRIPT ERROR|Parse Error" "$OUT/$name.log"; then echo "FAIL $name"; grep -E "SCRIPT ERROR|Parse Error" "$OUT/$name.log" | head -3
 elif [ -f "$OUT/$name.png" ]; then echo "ok   $name"; else echo "MISS $name (no image)"; fi
}
shot 01-black        40  --script prologue
shot 02-first-light  260 --script prologue
shot 03-legs-gift    470 --script prologue
shot 04-road         120 --from cl1-o1-road
shot 05-verge-slime  200 --from cl1-o1-verge
shot 06-flowers      120 --from cl1-o1-flowers
shot 07-under-bed    120 --from cl1-bank-b21
shot 08-camp-bed     160 --from cl1-o1-camp
shot 09-yard         120 --from cl1-o1-yard
shot 10-gate-dark    160 --from cl1-o1-gate
shot 11-curtain      160 --from cl1-bank-b62
shot 12-fight        420 --from godot-overlook-stair
shot 13-box-relay    120 --from workshop-relay
shot 14-box-engine   120 --from workshop-engine
shot 15-box-gallery  120 --from workshop-gallery
shot 16-secret       120 --from cl1-secret-r2
shot 17-ending       400 --photos --from cl1-atlas-crossroads
