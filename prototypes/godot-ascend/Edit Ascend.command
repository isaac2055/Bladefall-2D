#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
if [ ! -x "$ENGINE_PATH" ]; then
 echo 'Open Play Ascend.command once to install the pinned Godot engine.'
 exit 1
fi
exec "$ENGINE_PATH" --editor --path "$PROJECT_DIR" res://levels/world1.tscn
