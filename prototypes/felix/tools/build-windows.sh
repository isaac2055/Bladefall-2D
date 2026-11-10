#!/bin/bash
set -euo pipefail

run_engine() {
 local build_log
 build_log="$(mktemp -t felix-godot-build)"
 if ! "$ENGINE_PATH" "$@" >"$build_log" 2>&1; then cat "$build_log"; rm -f "$build_log"; return 1; fi
 if rg -q 'SCRIPT ERROR|Parse Error|ERROR:' "$build_log"; then cat "$build_log"; rm -f "$build_log"; return 1; fi
 cat "$build_log"
 rm -f "$build_log"
}

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
BUILD_DIR="$PROJECT_DIR/exports/windows"
[ -x "$ENGINE_PATH" ] || { echo 'Set GODOT to your Godot 4.5.1 executable.'; exit 1; }
mkdir -p "$BUILD_DIR"
run_engine --headless --path "$PROJECT_DIR" --editor --import --quit
run_engine --headless --path "$PROJECT_DIR" --export-release Windows "$BUILD_DIR/Felix.exe"
cp "$PROJECT_DIR/WINDOWS-README.txt" "$BUILD_DIR/Read Me.txt"
cp "$PROJECT_DIR/GODOT-LICENSE.txt" "$BUILD_DIR/GODOT-LICENSE.txt"
cp "$PROJECT_DIR/audio/ATTRIBUTION.txt" "$BUILD_DIR/Audio Credits.txt"
python3 - "$BUILD_DIR" "$PROJECT_DIR/exports/Felix-Windows.zip" <<'PY'
import pathlib,struct,sys,zipfile
folder=pathlib.Path(sys.argv[1])
exe=(folder/'Felix.exe').read_bytes()
assert exe[:2]==b'MZ', 'Missing Windows executable'
offset=struct.unpack_from('<I',exe,0x3c)[0]
assert exe[offset:offset+4]==b'PE\0\0', 'Invalid PE signature'
assert struct.unpack_from('<H',exe,offset+4)[0]==0x8664, 'Not an x64 Windows executable'
assert (folder/'Felix.pck').stat().st_size>1000000, 'Missing game pack'
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
 for name in ['Felix.exe','Felix.pck','Read Me.txt','GODOT-LICENSE.txt','Audio Credits.txt']:
  archive.write(folder/name,'Felix/'+name)
with zipfile.ZipFile(sys.argv[2]) as archive:
 assert archive.testzip() is None, 'ZIP integrity check failed'
print('Built and checked Windows x64 ZIP:',sys.argv[2])
PY
