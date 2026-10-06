#!/bin/sh
# build one world for run 6 (fresh road unless the road cache key still matches)
N=$1
cd "/Users/computer/Projects/Bladefall-2D Antigravity"
node scripts/climb/build-climbs.mjs --only $N --verbose --emit scripts/climb/.cache/worlds-r6 > scripts/climb/.cache/worlds-r6/w$N.log 2>&1
echo "exit $?" >> scripts/climb/.cache/worlds-r6/w$N.log
