#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
if [ ! -x "$ENGINE_PATH" ]; then
 ENGINE_PATH="/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot"
fi
[ -x "$ENGINE_PATH" ] || { echo 'Set GODOT to Godot 4.5.1, or open the standalone Felix app.'; exit 1; }
exec "$ENGINE_PATH" --path "$PROJECT_DIR" "$@"
