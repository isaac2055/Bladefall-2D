#!/usr/bin/env bash
# Rebuilds ./netlify-deploy/ — a self-contained, static copy of the game ready
# to publish (drag-and-drop into Netlify, or point a Netlify site at this folder).
# Run this whenever you've changed the game in public/ and want a fresh copy to
# push:  ./build-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/public"
OUT="$ROOT/netlify-deploy"

# Every file the running game actually needs (dev-only files like serve.mjs,
# node_modules and package.json are deliberately left out).
ASSETS=(
  index.html
  authoring.html
  dialogue-editor.html
  recollection-player.html
  index.html.pre-multiplayer.bak
  bladefall-core.js
  bladefall-simulation.js
  bladefall-renderer.js
  bladefall-platformer.js
  bladefall-environment.js
  bladefall-reactions.js
  bladefall-interactions.js
  bladefall-portals.js
  bladefall-remix.js
  bladefall-fluids.js
  bladefall-ecology.js
  bladefall-ai.js
  bladefall-authoring.js
  bladefall-campaign.js
  bladefall-charters.js
  bladefall-progression.js
  bladefall-secrets.js
  bladefall-capabilities.js
  bladefall-movement-progression.js
  bladefall-portal-progression.js
  bladefall-weapon-progression.js
  bladefall-equipment-economy.js
  bladefall-echoes.js
  bladefall-gifts.js
  bladefall-recollections.js
  bladefall-advancement.js
  bladefall-zones.js
  bladefall-zone-state.js
  bladefall-recovery.js
  bladefall-streaming.js
  bladefall-world.js
  bladefall-story.js
  bladefall-shops.js
  bladefall-quests.js
  bladefall-milestones.js
  bladefall-foundation-audit.js
  bladefall-cinematics.js
  bladefall-storage.js
  bladefall-input.js
  bladefall-content.js
  bladefall-presentation.js
  bladefall-multiplayer.js
  bladefall-audio.js
  bladefall-camera.js
  bladefall-release.js
  bladefall-blood.js
  bladefall-inventory.js
  bladefall-dialogue.js
  bladefall-harness.js
  littlejs.min.js
  music.mp3
  audio/ATTRIBUTION.md
  audio/music/strange-worlds.ogg
  audio/music/sunlight-through-leaves.ogg
  audio/music/whispering-woods.ogg
  audio/music/heat-of-battle.mp3
  audio/music/wind-over-the-trees.ogg
  audio/music/floating-dream.ogg
  audio/music/drifting-memories.ogg
  audio/music/abnormal-circumstances.mp3
  audio/music/clockwork.mp3
  audio/music/element.mp3
  audio/sfx/level1/dirt-chain-run-1.ogg
  audio/sfx/level1/dirt-chain-run-2.ogg
  audio/sfx/level1/dirt-chain-run-3.ogg
  audio/sfx/level1/dirt-chain-jump.ogg
  audio/sfx/level1/dirt-chain-land.ogg
  audio/sfx/level1/stone-chain-run-1.ogg
  audio/sfx/level1/stone-chain-run-2.ogg
  audio/sfx/level1/stone-chain-run-3.ogg
  audio/sfx/level1/stone-chain-jump.ogg
  audio/sfx/level1/stone-chain-land.ogg
  audio/sfx/level1/sword-attack-1.ogg
  audio/sfx/level1/sword-attack-2.ogg
  audio/sfx/level1/sword-attack-3.ogg
  audio/sfx/level1/sword-impact-1.ogg
  audio/sfx/level1/sword-impact-2.ogg
  audio/sfx/level1/sword-impact-3.ogg
  audio/sfx/level1/pickup-lock.ogg
  manifest.webmanifest
  sw.js
  peerjs.min.js
  icon.svg
  icon-192.png
  icon-512.png
  icon-192-maskable.png
  icon-512-maskable.png
  apple-touch-icon.png
)

rm -rf "$OUT"
mkdir -p "$OUT"
for f in "${ASSETS[@]}"; do
  mkdir -p "$(dirname "$OUT/$f")"
  cp "$SRC/$f" "$OUT/$f"
done
# Config + instructions live in the repo and are copied in verbatim.
cp "$ROOT/deploy-assets/netlify.toml" "$OUT/netlify.toml"
cp "$ROOT/deploy-assets/README.md"    "$OUT/README.md"

echo "Built $OUT with ${#ASSETS[@]} game files + netlify.toml + README.md"
echo "Publish it: drag the netlify-deploy folder onto https://app.netlify.com/drop"
