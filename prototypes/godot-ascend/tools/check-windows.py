#!/usr/bin/env python3
"""Check the Windows PCK using the local Godot host; this does not run the PE executable."""
import os
from pathlib import Path
import re
import subprocess
import sys

project = Path(__file__).resolve().parents[1]
repo = project.parents[1]
engine = os.environ.get('GODOT', str(repo / '.cache/godot/Godot.app/Contents/MacOS/Godot'))
output = repo / '.cache/web/windows-pack-checks'
output.mkdir(parents=True, exist_ok=True)
overlay = output / 'tests.pck'
built = subprocess.run([engine, '--headless', '--path', str(project), '--script', 'tools/test-pack-overlay.gd', '--', str(overlay)], capture_output=True, text=True)
log = built.stdout + built.stderr
assert built.returncode == 0 and 'TEST OVERLAY READY' in log and not re.search(r'(?m)^(ERROR:|SCRIPT ERROR:)', log), log
for suite in ['interruption_recovery', 'player_release', 'saves_progression', 'save_transfer']:
    env = os.environ.copy()
    env.update(ASCEND_TEST_OVERLAY=str(overlay), ASCEND_TEST_SCRIPT=f'res://tests/{suite}.gd')
    result = subprocess.run([engine, '--headless', '--main-pack', str(project / 'exports/windows/Bladefall.pck'), '--script', str(project / 'tools/test-pack-bootstrap.gd')], cwd=output, env=env, capture_output=True, text=True, timeout=300)
    log = result.stdout + result.stderr
    (output / f'{suite}.log').write_text(log)
    passed = (result.returncode == 0 and f'PACKAGED TEST STARTED · res://tests/{suite}.gd' in log and re.search(r'(?m)^PASS\s', log) and not re.search(r'(?m)^(ERROR:|SCRIPT ERROR:|FAIL\b)', log))
    print('PASS' if passed else 'FAIL', 'Windows-exported game pack:', suite, flush=True)
    if not passed:
        print(log)
        sys.exit(1)
print('Windows executable still requires a Windows PC play test.', flush=True)
