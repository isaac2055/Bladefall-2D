#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$PROJECT_DIR/tools/run.sh" --world 4 --room 19
