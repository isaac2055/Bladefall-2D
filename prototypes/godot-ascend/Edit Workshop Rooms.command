#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
 echo 'This editor needs Node.js. Open this project in Codex for help setting it up.'
 read -r -p 'Press Enter to close.'
 exit 1
fi
exec node "$PROJECT_DIR/room-editor/server.mjs" --open
