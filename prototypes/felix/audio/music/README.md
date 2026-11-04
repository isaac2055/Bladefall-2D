# Chapter One soundtrack

Three instrumental scores generated with the connected ElevenLabs Music v2 plugin.
All three playable Ogg Vorbis files are stereo, 48 kHz, exactly 240 seconds, and loop.

| Track | Character |
| --- | --- |
| Socks & Starlight | Felt piano, celeste, nylon harmonics and a warm bedtime pad, 72 BPM |
| A Room Full of Mountains | Soft 16-bit marimba, triangle bass and muted arpeggios, 80 BPM |
| The Good Days, Packed Away | Music box, nylon guitar, felt piano and restrained strings, 64 BPM |

Press **Esc** during play, choose a track under **Music**, and keep listening while
the game is paused. The slider controls music volume. **Keep climbing** resumes
play with the selected track; track choice and volume persist across restarts.
The original Chapter One story ducking still silences music during the parents'
fight and lowers it in the wardrobe. Menu auditioning uses a steady listening level.
SFX and ambience retain their original pause behavior.

## Generation and looping

`tracks.json` contains the exact prompts and instrumental settings.
`generation.json` records the flow, node, session and generation IDs from
[the ElevenLabs soundtrack flow](https://elevenlabs.io/app/flows/Mvyx75tWe9Y4BvAigODI).
Each track's sibling `.json` records its source hash, final Ogg hash, sample length,
peak, minimum one-second RMS and measured loop-seam sample delta.

A two-bar overlap was included beyond four minutes in each generated master.
`tools/felix-music.py` normalizes the master, blends the tail into the original
head using equal-power curves, and exports a four-minute loop. The musical
length is a whole number of bars at each requested tempo. Ogg Vorbis avoids
MP3 playback padding at the loop boundary. The final PCM is checked for clipping,
unexpected silent sections and an anomalous seam discontinuity.

To rebuild from the already-generated masters, download them from the ElevenLabs
flow and save them as `shots/music-source/<track-id>.mp3`, then run:

```sh
python3 tools/felix-music.py
```

This requires NumPy and FFmpeg with a Vorbis encoder. It never generates music,
contacts the paid generation API or needs a key. The raw masters are scratch;
the committed Oggs, Godot import files and provenance are the game deliverables.

## Verification

`tools/test_felix_presentation.gd` checks the naming sequence, live menu selection,
track lengths, playback across each loop boundary, pause behavior, saved settings,
volume mute and resuming play. Run with the project's Godot binary:

```sh
godot --path . --script tools/test_felix_presentation.gd
```

Also run the standard screenshot set and the unchanged workshop reference route.
The live audio test records how many of the three tracks were present; only
`PASS (3/3 music tracks present)` verifies the complete soundtrack integration.
