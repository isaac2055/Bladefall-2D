#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SHARED_ENGINE="$PROJECT_DIR/../../../Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot"
if [ -z "${GODOT:-}" ] && [ -x "$SHARED_ENGINE" ]; then export GODOT="$SHARED_ENGINE"; fi
exec "$PROJECT_DIR/tools/run.sh" --dev-graphics --world 22 --room 8 "$@"
