#!/usr/bin/env python3
"""An echo's road music: the original region's own theme, walked backwards — 8% slower and lower,
the top end dulled, a long echo under it — then loudness-normalised like every other track.
Usage: scripts/fractured-music.py <original.mp3 in public/audio/music> [target LUFS, default -21]
Writes public/audio/music/fractured-<original>.mp3"""
import json, re, subprocess, sys
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUS = os.path.join(ROOT, 'public', 'audio', 'music') + os.sep
src = sys.argv[1]; target = float(sys.argv[2]) if len(sys.argv) > 2 else -21
dst = 'fractured-' + src
tone = 'asetrate=44100*0.92,aresample=44100,lowpass=f=4200,aecho=0.8:0.55:190|360:0.22|0.12'
import tempfile
tmp = os.path.join(tempfile.gettempdir(), 'bladefall-fractured-tone.wav')
subprocess.run(['ffmpeg', '-hide_banner', '-y', '-i', MUS + src, '-af', tone, '-ar', '44100', tmp], capture_output=True, text=True, check=True)
f = f'loudnorm=I={target}:TP=-1:LRA=11'
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', f + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr).group(0))
f2 = f + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-hide_banner', '-y', '-i', tmp, '-af', f2, '-ar', '44100', '-b:a', '192k', MUS + dst], capture_output=True, text=True, check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', MUS + dst, '-af', f'loudnorm=I={target}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m2 = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr).group(0))
print(dst, 'out', m2['input_i'], 'LUFS, tp', m2['input_tp'])
