#!/usr/bin/env python3
"""Check the actual APK assets on the matching desktop engine; also play-test on Android."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import zipfile

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',required=True,type=Path)
args=parser.parse_args()
project=Path(__file__).resolve().parents[1]
repo=project.parents[1]
engine=os.environ.get('ANDROID_GODOT',str(repo/'.cache/godot-android/Godot.app/Contents/MacOS/Godot'))
stage=repo/'.cache/godot-android/project'
out=args.output.resolve();out.mkdir(parents=True,exist_ok=True)
assets=out/'assets'
if assets.exists():shutil.rmtree(assets)
assets.mkdir()
apk=project/'exports/Bladefall-Android.apk'
with zipfile.ZipFile(apk) as archive:
    assert archive.testzip() is None,'Corrupt APK'
    for name in ('assets/GODOT-LICENSE.txt','assets/audio/ATTRIBUTION.txt'):
        assert archive.read(name).strip(), f'Missing packaged credits: {name}'
    for abi,machine in [('armeabi-v7a',40),('arm64-v8a',183)]:
        elf=archive.read(f'lib/{abi}/libgodot_android.so')
        assert elf[:4]==b'\x7fELF' and int.from_bytes(elf[18:20],'little')==machine,abi
    for name in archive.namelist():
        if not name.startswith('assets/') or name.endswith('/'):continue
        relative=Path(name[len('assets/'):]);assert not relative.is_absolute() and '..' not in relative.parts
        target=assets/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(archive.read(name))
script=out/'pack-assets.gd'
script.write_text('''extends SceneTree
var pack=PCKPacker.new()
func include_tree(path,root,prefix="res://"):
 var folder=DirAccess.open(path)
 folder.include_hidden=true
 for name in folder.get_directories(): include_tree(path.path_join(name),root,prefix)
 for name in folder.get_files():
  var file=path.path_join(name)
  assert(pack.add_file(prefix+file.trim_prefix(root+"/"),file)==OK)
func _initialize():
 var args=OS.get_cmdline_user_args()
 assert(pack.pck_start(args[1])==OK)
 include_tree(args[0],args[0])
 include_tree(args[2],args[2],"res://tests/")
 assert(pack.flush()==OK)
 print("APK ASSETS PACK READY")
 quit()
''')
def command(arguments):
    result=subprocess.run([engine,'--headless','--path',str(stage),*map(str,arguments)],capture_output=True,text=True,timeout=300)
    log=result.stdout+result.stderr
    assert result.returncode==0 and not re.search(r'(?m)^(ERROR:|SCRIPT ERROR:|FAIL\b)',log),log
    return log
pack=out/'android-assets.pck';overlay=out/'tests.pck'
assert 'APK ASSETS PACK READY' in command(['--script',script,'--',assets,pack,project/'tests'])
# Tests are the only additions to the APK assets. Direct --script startup avoids
# swapping the SceneTree script during _init(), which differs between engines.
results=[]
for suite in ['interruption_recovery','fingerprint_compat','touch_controls','sequential_unlocks','player_release','saves_progression','save_transfer','passage_reveal','connected_roads','connected_saves']:
    script_name=f'res://tests/{suite}.gd'
    log_file=out/f'{suite}.log'
    with log_file.open('w') as file:
        result=subprocess.run([engine,'--headless','--main-pack',str(pack),'--script',script_name],cwd=out,stdout=file,stderr=subprocess.STDOUT,text=True,timeout=300)
    log=log_file.read_text()
    passed=(result.returncode==0 and re.search(r'(?m)^PASS\s',log) and not re.search(r'(?m)^(ERROR:|SCRIPT ERROR:|FAIL\b)',log))
    results.append({'suite':suite,'passed':bool(passed)});(out/'results.json').write_text(json.dumps(results,indent=2)+'\n')
    print('PASS' if passed else 'FAIL','Android APK assets:',suite,flush=True)
    if not passed:raise SystemExit(log[-5000:])
print('PASS all APK asset checks; Android emulator/device launch remains a separate check.',flush=True)
