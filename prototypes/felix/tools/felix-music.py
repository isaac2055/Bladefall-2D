#!/usr/bin/env python3
"""Prepare the three ElevenLabs connector generations as 240s Vorbis loops.

Run from the Felix project folder. Requires ffmpeg and numpy. Save the three connector downloads under
shots/music-source using the track IDs from audio/music/tracks.json.
This script never starts a generation or spends ElevenLabs credits.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PLAYLIST = ROOT / 'audio/music/tracks.json'
SOURCE = ROOT / 'shots/music-source'


def prepare(track, raw):
    import numpy as np
    output = ROOT / track['path'].removeprefix('res://')
    rate = 48000
    overlap = round((480 / track['bpm']) * rate)
    target = 240 * rate
    pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(raw), '-af',
        'loudnorm=I=-20:TP=-2:LRA=7,aresample=48000', '-ac', '2', '-f', 'f32le', '-'])
    samples = np.frombuffer(pcm, dtype='<f4').reshape(-1, 2).copy()
    required = target + overlap
    if len(samples) < required - rate // 4:
        raise RuntimeError(f'Generation too short for {track["title"]}: {len(samples)/rate:.2f}s')
    if len(samples) < required:
        samples = np.pad(samples, ((0, required-len(samples)), (0, 0)))
    samples = samples[:required]
    angle = np.linspace(0, math.pi/2, overlap, endpoint=True, dtype=np.float32)[:, None]
    wrap = samples[-overlap:] * np.cos(angle) + samples[:overlap] * np.sin(angle)
    loop = np.concatenate([samples[overlap:target], wrap])
    peak = float(np.max(np.abs(loop)))
    if peak > 0.84: loop *= 0.84 / peak
    assert len(loop) == target and np.isfinite(loop).all()
    # The last sample comes from the original head, directly before the first
    # sample of the loop. Thus we crossfade the tail INTO the head, not into silence.
    encoders = subprocess.check_output(['ffmpeg', '-hide_banner', '-encoders'], stderr=subprocess.DEVNULL, text=True)
    codec = ['-c:a', 'libvorbis'] if 'libvorbis' in encoders else ['-c:a', 'vorbis', '-strict', 'experimental']
    partial = output.with_suffix('.working.ogg')
    encoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(rate),
        '-ac', '2', '-i', '-', *codec, '-q:a', '6', str(partial)], stdin=subprocess.PIPE)
    encoder.communicate(loop.astype('<f4').tobytes())
    if encoder.returncode: raise RuntimeError('Vorbis encode failed')
    partial.replace(output)
    decoded = subprocess.check_output(['ffmpeg','-v','error','-i',str(output),'-ar',str(rate),
        '-ac','2','-f','f32le','-'])
    check = np.frombuffer(decoded, dtype='<f4').reshape(-1,2)
    seam = float(np.max(np.abs(check[-1]-check[0])))
    normal_delta = float(np.quantile(np.abs(np.diff(check[:rate*10],axis=0)),.999))
    assert seam < max(.01, normal_delta*4), f'Loop seam discontinuity: {seam}'
    assert float(np.max(np.abs(check))) < .999, 'Clipped output'
    windows = check[:len(check)//rate*rate].reshape(-1,rate,2)
    rms = np.sqrt(np.mean(windows**2,axis=(1,2)))
    assert float(np.min(rms)) > 10**(-55/20), 'Unexpected silent section'
    metadata = dict(provider='ElevenLabs', model_id=track['model_id'], instrumental=True, lyrics_type='instrumental',
        prompt=track['prompt'], duration_seconds=len(check)/rate, sample_rate=rate, channels=2,
        overlap_seconds=overlap/rate, peak=float(np.max(np.abs(check))),
        seam_delta=seam, typical_delta_999=normal_delta,
        minimum_one_second_rms_db=20*math.log10(float(np.min(rms))),
        raw_sha256=hashlib.sha256(raw.read_bytes()).hexdigest(),
        ogg_sha256=hashlib.sha256(output.read_bytes()).hexdigest())
    output.with_suffix('.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print(f'Prepared {track["title"]}: {len(check)/rate:.3f}s, seam={seam:.6f}',flush=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--track',choices=['socks-and-starlight','room-full-of-mountains','good-days-packed-away'])
    args=parser.parse_args()
    tracks=json.loads(PLAYLIST.read_text())['tracks']
    if args.track:tracks=[t for t in tracks if t['id']==args.track]
    SOURCE.mkdir(parents=True,exist_ok=True)
    for track in tracks:
        raw=SOURCE/(track['id']+'.mp3')
        if not raw.exists():
            raise RuntimeError(f'Missing ElevenLabs download: {raw.name}; this script does not generate music.')
        prepare(track,raw)

if __name__=='__main__':
    try: main()
    except RuntimeError as error:
        raise SystemExit(str(error))
