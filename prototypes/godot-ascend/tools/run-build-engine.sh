# Sourced by the export scripts after ENGINE_PATH is set.
run_engine() {
 local build_log
 build_log="$(mktemp -t bladefall-godot-build)"
 local status=0
 "$ENGINE_PATH" "$@" >"$build_log" 2>&1 || status=$?
 if rg -q 'SCRIPT ERROR|Parse Error|ERROR:' "$build_log"; then status=1; fi
 cat "$build_log"
 rm -f "$build_log"
 return "$status"
}
