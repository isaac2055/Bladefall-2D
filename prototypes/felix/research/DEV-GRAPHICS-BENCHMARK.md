# Graphics Lab benchmark

Run `tools/benchmark-graphics.gd` with the graphical Godot 4.5.1 executable from either game's project folder. Set `GODOT` to its executable path and use a fresh absolute output directory. Run one game at a time and leave the game window at its initial size.

Felix, Phantom Causeway:

```sh
"$GODOT" --path . --script tools/benchmark-graphics.gd -- \
  --dev-graphics --chapter 3 --from workshop-return-launch \
  --benchmark-out /tmp/felix-graphics-benchmark
```

Bladefall, Fractured Woods:

```sh
"$GODOT" --path . --script tools/benchmark-graphics.gd -- \
  --dev-graphics --world 22 --room 8 \
  --benchmark-out /tmp/bladefall-graphics-benchmark
```

The benchmark reloads the room for each case, freezes gameplay physics and advances the presentation at a fixed 60 Hz step. It verifies the same room, player position, camera, checkpoint, world frame and window size throughout. Developer mode keeps campaign progress and saved Graphics Lab looks out of the benchmark writes.

The matrix covers Original, Clear, Storm, Storm with clouds, rain, post-processing or decorative shadows removed one at a time, and Storm at Half resolution. All other cases use Full resolution, including rooms that ordinarily default to Half. The tool warms each case for 60 rendered frames and samples 90 more, with three repeats and alternating case order. Override with `--benchmark-warmup=N`, `--benchmark-frames=N` and `--benchmark-repeats=N`. It requests VSync off and reports the resulting mode.

The output directory holds one screenshot per case and `graphics-benchmark.json`. The JSON includes the settings and internal resolution used, per-run median and 95th-percentile wall-frame time, draw calls, CPU-side draw timings and the median within-pass difference from Storm. Wall time measures frame cadence, which includes rendering and scheduling. The CPU timings cover the existing view instrumentation. These measurements describe a frozen scene on the current machine.

## Apple M1 sample

Two passes per room with 60 warmup frames and 45 measured frames per case. The figures below are the median of the two run medians.

| Scene | Storm Full | Storm Half | Change |
| --- | ---: | ---: | ---: |
| Bladefall, The Oath Root | 19.55 ms | 16.49 ms | −3.05 ms |
| Felix, The Launch Waiting on the Return | 17.58 ms | 15.44 ms | −2.14 ms |

Half gave the largest median improvement among the Storm changes in these two samples. Turning off any one effect shifted the median by less than 0.7 ms in each room. The full reports and matched captures are in the Felix worktree's `.cache/graphics-lab-round9/`.
