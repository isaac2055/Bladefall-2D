#!/usr/bin/env python3
"""Set only the Android tool paths in the host's matching Godot editor settings."""
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
version=subprocess.check_output([os.environ['GODOT'],'--version'],text=True).split('.')[0:2]
if sys.platform=='darwin': folder=Path.home()/'Library/Application Support/Godot'
elif sys.platform=='win32': folder=Path(os.environ['APPDATA'])/'Godot'
else: folder=Path(os.environ.get('XDG_CONFIG_HOME',Path.home()/'.config'))/'godot'
path=Path(os.environ.get('GODOT_EDITOR_SETTINGS',folder/('editor_settings-'+'.'.join(version)+'.tres')))
path.parent.mkdir(parents=True,exist_ok=True)
text=path.read_text() if path.exists() else '[gd_resource type="EditorSettings" format=3]\n\n[resource]\n'
values={'export/android/android_sdk_path':os.environ['ANDROID_SDK_ROOT'],'export/android/java_sdk_path':os.environ['JAVA_HOME'],'export/android/debug_keystore':os.environ['ANDROID_DEBUG_KEYSTORE'],'export/android/shutdown_adb_on_exit':False}
for key,value in values.items():
 line=key+' = '+json.dumps(value if isinstance(value,bool) else str(value).replace('\\','/'))
 if re.search(r'^'+re.escape(key)+r' = .*$',text,re.M): text=re.sub(r'^'+re.escape(key)+r' = .*$',lambda _:line,text,flags=re.M)
 else: text+='\n'+line+'\n'
with tempfile.NamedTemporaryFile(mode='w',dir=path.parent,delete=False) as file:
 file.write(text)
 temporary=file.name
if path.exists(): os.chmod(temporary,stat.S_IMODE(path.stat().st_mode))
os.replace(temporary,path)
print('Configured Godot Android SDK, Java and debug-key paths.')
