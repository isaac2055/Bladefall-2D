#!/usr/bin/env python3
"""Check the real shipping PCK using a test-only resource overlay.

Godot can return zero when --script fails to load. Require actual assertion output
and reject loading/runtime errors as well as nonzero exit codes.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import time

SUITES = """fractured_woods_routes_required fractured_woods_three
fractured_woods_three_app fractured_woods_feel fractured_nine fractured_nine_app
feel_journey fractured_next fractured section_menu campaign_workshop application
world_checks world2_journey world3_journey black_woods causeway fractured_next_app
fractured_puzzles_app fractured_journey workshop six_puzzles_app five_puzzles_app
editor_play""".split()
SOURCE_HASH_SUITES = {"fractured_woods_three", "fractured_woods_three_app", "fractured_nine_app"}


def verified(code, log, script):
    assertions = re.search(r"(?m)^PASS(?:\s|$)", log)
    completion = re.search(r"(?m)^[A-Z][A-Z0-9 _-]* PASSED(?:\s|$)", log)
    return (code == 0 and f"PACKAGED TEST STARTED · {script}" in log
            and (assertions is not None or completion is not None)
            and re.search(r"(?m)^(?:ERROR:|SCRIPT ERROR:|FAIL\b)|\bFAILED\b", log) is None)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--suite", action="append", choices=SUITES)
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    repo = project.parents[1]
    engine = Path(os.environ.get("GODOT", repo / ".cache/godot/Godot.app/Contents/MacOS/Godot"))
    app = project / "exports/Bladefall Ascend Prototype.app/Contents/MacOS/BladefallAscend"
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    overlay = output / "tests.pck"
    overlay.unlink(missing_ok=True)
    built = subprocess.run([str(engine), "--headless", "--path", str(project), "--script",
                            "tools/test-pack-overlay.gd", "--", str(overlay)],
                           text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(built.stdout, end="", flush=True)
    if (built.returncode != 0 or not overlay.is_file()
            or "TEST OVERLAY READY" not in built.stdout
            or re.search(r"(?m)^(?:ERROR:|SCRIPT ERROR:)", built.stdout)):
        raise SystemExit("FAIL test-only overlay did not build")
    bootstrap = project / "tools/test-pack-bootstrap.gd"

    def run(name, extra=()):
        script = f"res://tests/{name}.gd"
        env = os.environ.copy()
        env.update(ASCEND_TEST_OVERLAY=str(overlay), ASCEND_TEST_SCRIPT=script)
        command = [str(app), "--headless", "--script", str(bootstrap)]
        if extra:
            command += ["--", *map(str, extra)]
        started = time.monotonic()
        try:
            result = subprocess.run(command, cwd=output, env=env, text=True,
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=300)
            code, log = result.returncode, result.stdout
        except subprocess.TimeoutExpired as exc:
            code = -99
            log = (exc.stdout or b"").decode() if isinstance(exc.stdout, bytes) else (exc.stdout or "")
        (output / f"packed-{name}.log").write_text(log)
        return {"test": name, "exit_code": code, "verified": verified(code, log, script),
                "seconds": round(time.monotonic() - started, 2)}, log

    control, _ = run("__missing_pack_validation__")
    if control["verified"]:
        raise SystemExit("FAIL missing-script negative control was accepted")
    print("PASS missing-script negative control rejected", flush=True)
    results = []
    for name in args.suite or SUITES:
        result, log = run(name, [project] if name in SOURCE_HASH_SUITES else [])
        results.append(result)
        (output / "pack-results.json").write_text(json.dumps(results, indent=2) + "\n")
        print("PASS" if result["verified"] else "FAIL", name, flush=True)
        if not result["verified"]:
            print(log[-4000:], flush=True)
    print("TOTAL", len(results), "FAILED", sum(not r["verified"] for r in results), flush=True)
    raise SystemExit(any(not r["verified"] for r in results))


if __name__ == "__main__":
    main()
