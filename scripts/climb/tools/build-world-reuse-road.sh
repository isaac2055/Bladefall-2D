#!/bin/sh
# build one world for run 6 on its cached road
N=$1
cd "/Users/computer/Projects/Bladefall-2D Antigravity"
node scripts/climb/build-climbs.mjs --only $N --verbose --reuse-road --emit scripts/climb/.cache/worlds-r6 > scripts/climb/.cache/worlds-r6/w$N.log 2>&1
echo "exit $?" >> scripts/climb/.cache/worlds-r6/w$N.log
