#!/usr/bin/env python3
"""Verify every Fractured/Core recording against the integrated runtime, including rewards."""
from pathlib import Path
import os, subprocess, sys
project=Path(__file__).resolve().parents[1]
godot=os.environ.get('GODOT',str(project.parents[1]/'.cache/godot/Godot.app/Contents/MacOS/Godot'))
out=project/'shots/advanced-routes';out.mkdir(parents=True,exist_ok=True)
for number in [21,22,23,101,102,103]:
    log=out/f'{number}.log'
    with log.open('w') as output:
        result=subprocess.run([godot,'--headless','--path',str(project),'--script','tests/sampler_journey.gd','--',str(number)],stdout=output,stderr=subprocess.STDOUT,timeout=600)
    text=log.read_text()
    passed=result.returncode==0 and 'JOURNEY FAILURES 0' in text and 'SCRIPT ERROR' not in text
    print('PASS' if passed else 'FAIL',number,flush=True)
    if not passed: print(text[-4000:]);sys.exit(1)
