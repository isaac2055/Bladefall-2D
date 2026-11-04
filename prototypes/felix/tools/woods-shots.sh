#!/bin/bash
# woods-shots.sh <out-dir> — screenshot Chapter Two's story moments (see felix-shots.sh).
G="${GODOT:-/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot}"
OUT="${1:?usage: woods-shots.sh <out-dir>}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
cd "$(dirname "$0")/.."
shot() { # name frames args...
 local name=$1 frames=$2; shift 2
 "$G" --path . -- --chapter 2 "$@" --capture "$OUT/$name.png" --capture-after "$frames" >"$OUT/$name.log" 2>&1 &
 local pid=$!
 for i in $(seq 1 600); do kill -0 $pid 2>/dev/null || break; sleep 0.5; done
 kill $pid 2>/dev/null
 if grep -qE "SCRIPT ERROR|Parse Error" "$OUT/$name.log"; then echo "FAIL $name"; grep -E "SCRIPT ERROR|Parse Error" "$OUT/$name.log" | head -3
 elif [ -f "$OUT/$name.png" ]; then echo "ok   $name"; else echo "MISS $name (no image)"; fi
}
shot 01-title       60
shot 02-walk        150  --tour
shot 03-kneel       640  --tour
shot 04-sir-felix   1010 --tour
shot 05-dusk        2400 --tour
shot 06-night-road  9000 --tour
shot 07-cabin       250  --from cl2-atlas-crossroads
shot 08-storm       1250 --from cl2-atlas-crossroads
shot 09-story       260  --from workshop-crooked
shot 10-secret      100  --from cl2-secret-w2 --place 260 104
shot 11-ending      10450 --reference workshop-borrowed --chain
