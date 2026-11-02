#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENGINE="${GODOT:-$HOME/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot}"
exec "$ENGINE" --path "$PROJECT_DIR" -- "$@"
