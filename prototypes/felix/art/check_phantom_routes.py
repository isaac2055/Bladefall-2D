"""Run the four Chapter Three art gates sequentially; preserve logs and stop at the stated finish.
Usage: python3 art/check_phantom_routes.py shots/ch3-after-1-routes
"""
from pathlib import Path
import json,re,subprocess,sys,time
G='/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot'
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
cases=[('phantom-road',['--chapter','3','--tour','--report'],r'(?:ROOM story-walk-0 deaths=0|AT story-walk-0 .*deaths=0)'),
       ('phantom-drive',['--chapter','3','--reference','workshop-borrowed-bridge','--chain','--report'],r'AT cl3-atlas-crossroads .*deaths=0 .*phase=end(?:\s|$)'),
       ('woods-tale',['--chapter','2','--reference','workshop-borrowed','--chain','--report'],r'AT cl2-atlas-crossroads .*deaths=0 .*phase=end(?:\s|$)'),
       ('chapter-one',['--reference','workshop-relay','--chain','--report'],r'AT cl1-atlas-crossroads .*deaths=0 .*phase=end(?:\s|$)')]
results=[]
for name,args,finish in cases:
 path=out/(name+'.log');print('START',name,flush=True)
 with path.open('w') as dest:
  p=subprocess.Popen([G,'--path','.','--',*args],stdout=dest,stderr=subprocess.STDOUT)
  started=time.monotonic();matched='';error=''
  try:
   while time.monotonic()-started<900:
    log=path.read_text()
    if 'SCRIPT ERROR' in log or 'Parse Error' in log:error='script error';break
    if re.search(r'deaths=[1-9]',log):error='nonzero deaths';break
    found=re.search(finish,log)
    if found:matched=found.group();break
    if p.poll() is not None:error=f'process ended before finish ({p.returncode})';break
    time.sleep(.4)
   if not matched and not error:error='route timed out'
  finally:
   if p.poll() is None:p.terminate()
   try:p.wait(timeout=10)
   except subprocess.TimeoutExpired:p.kill();p.wait()
 log=path.read_text()
 if 'SCRIPT ERROR' in log or 'Parse Error' in log:error='script error'
 result=dict(route=name,passed=bool(matched) and not error,reached=matched,error=error,seconds=round(time.monotonic()-started,1))
 results.append(result);print(json.dumps(result),flush=True)
 (out/'results.json').write_text(json.dumps(results,indent=2)+'\n')
 if not result['passed']:raise SystemExit(1)
