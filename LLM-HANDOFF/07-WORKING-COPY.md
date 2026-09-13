# Creating a small model working copy

Use the included script from the Bladefall project root:

```bash
./LLM-HANDOFF/make-working-copy.sh /path/to/Bladefall-working-copy runnable
```

Modes:

- `runnable` (recommended) includes source, tests, validators, compact design
  documents, icons, all current music/SFX, and the final-boss legacy cue.
- `code` omits large binary audio/images. It is useful for quick source analysis
  but is not an audio-faithful playable copy.

The destination must be absent or empty. The script never deletes or overwrites
an existing non-empty project.

## What the script excludes

- `.git/` (clone `main` from GitHub instead when history is needed; since
  2026-09-13 it matches the tree);
- `node_modules/`;
- generated `netlify-deploy/`;
- historical screenshot/video atlases and contact sheets;
- `.DS_Store` and local `.claude/`.

`public/index.html.pre-multiplayer.bak` is **not** excluded: it is the preserved
original game that `recollection-player.html` loads, so a copy without it has a
broken postgame Recollection player.

## Expected workflow in the copy

```bash
cd /path/to/Bladefall-working-copy
npm install
npm test
npm run serve
```

After edits:

```bash
./build-deploy.sh
npm run release:check
```

The copy script also writes `WORKING-COPY-MANIFEST.txt` with its mode, source,
date, and explicit exclusions.

## Historical copy verification — 2026-08-21

On 2026-08-21 the generator was run in both modes from a clean empty
destination:

| Mode | Size | Files | Verified contents |
| --- | ---: | ---: | --- |
| `runnable` | 79 MB | 246 | runtime, modules, tests, scripts, all audio, icons, compact plans/charters |
| `code` | 6.0 MB | 212 | same source/test/planning context, with binary audio/images omitted |

Both copies excluded `.git/`, `node_modules/`, `netlify-deploy/`, and historical
documentation media. The runnable copy contained `Strange Worlds`, the legacy
`public/music.mp3` cue, all current `bladefall-*.js` authorities, and the
working-copy manifest. Re-run these checks if the asset layout changes.

## Copy size rationale

The original folder's size is dominated by duplicated/reproducible data:

- historical evidence in `docs/`;
- deploy mirror duplicate;
- reinstallable `node_modules/`;
- runtime audio.

The runnable handoff intentionally retains audio because missing tracks change
the game's presentation and can hide audio-routing regressions. It drops the
other large categories, reducing copy time dramatically while preserving the
actual game and its test/authoring context.

Keep one complete archival backup separately. The lean copy is a working model
workspace, not a substitute for historical evidence or source-control repair.

## September handoff refresh

The generator now also carries root `TESTING.md` / `KNOWN_BUGS.md`,
`docs/tas/README.md`, and README-style level charters (including Frostfell).
The existing whole-directory `scripts/` and `tests/` copies include the new route
validators automatically. Small charter receipts remain included; screenshots
remain excluded. See `10-HANDOFF-VERIFICATION.md` for this refresh's checks;
the August size/file counts above are not current measurements.
