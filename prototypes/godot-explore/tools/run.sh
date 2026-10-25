#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
if [ ! -x "$ENGINE_PATH" ]; then
 if command -v godot >/dev/null 2>&1; then ENGINE_PATH="$(command -v godot)";
 elif [ "$(uname -s)" = Darwin ]; then
  mkdir -p "$REPO_DIR/.cache/godot"
  curl -fL --retry 2 'https://github.com/godotengine/godot/releases/download/4.5.1-stable/Godot_v4.5.1-stable_macos.universal.zip' -o "$REPO_DIR/.cache/godot/engine.zip"
  printf '%s  %s\n' '65c27959d02aaacfc131ec7ecb90179ba8045200cb02982bf2be96d117010b8a' "$REPO_DIR/.cache/godot/engine.zip" | shasum -a 256 -c -
  unzip -qo "$REPO_DIR/.cache/godot/engine.zip" -d "$REPO_DIR/.cache/godot"
 else echo 'Set GODOT to a Godot 4.5.1 executable, then run this script again.'; exit 1; fi
fi
"$ENGINE_PATH" --headless --path "$PROJECT_DIR" --editor --import --quit
exec "$ENGINE_PATH" --path "$PROJECT_DIR" -- "$@"
