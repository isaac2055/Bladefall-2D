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
  astra-respec.html
  astra-respec.js
  fable-respec.html
  fable-respec.js
  dialogue-editor.html
  recollection-player.html
  index.html.pre-multiplayer.bak
  bladefall-core.js
  bladefall-simulation.js
  bladefall-renderer.js
  bladefall-respec-renderer.js
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
  bladefall-coop-journey.js
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
  audio/music/midnight-field.mp3
  audio/music/watchful-greenwood.mp3
  audio/music/the-iron-causeway.mp3
  audio/music/iron-juggernaut.mp3
  audio/music/canyon-updrafts.mp3
  audio/music/crosshairs-over-open-ground.mp3
  audio/music/crosshairs-in-the-dark.mp3
  audio/music/stony-whispers-of-the-keep.mp3
  audio/music/iron-gavel-descent.mp3
  audio/music/sentence-of-the-shield-warden.mp3
  audio/music/hearthfire-in-the-frost.mp3
  audio/music/glaciated-court-of-glass.mp3
  audio/music/the-sorcerers-hall-of-mirrors.mp3
  audio/music/the-eternal-furnace.mp3
  audio/music/the-obsidian-foundry.mp3
  audio/music/forge-of-the-molten-colossus.mp3
  audio/music/chamber-of-inverted-gravity.mp3
  audio/music/paradox-void-assault.mp3
  audio/music/iron-oath-of-the-night-attack.mp3
  audio/music/the-black-procession.mp3
  audio/music/a-crown-of-ashes.mp3
  audio/music/engine-of-the-frozen-garrison.mp3
  audio/music/chasing-daylight-on-broken-rails.mp3
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
# Upload-ready headers ship from public, so both deployment folders behave alike.
cp "$SRC/_headers" "$OUT/_headers"
# Config + instructions live in the repo and are copied in verbatim.
cp "$ROOT/deploy-assets/netlify.toml" "$OUT/netlify.toml"
cp "$ROOT/deploy-assets/README.md"    "$OUT/README.md"

echo "Built $OUT with ${#ASSETS[@]} game files + netlify.toml + README.md"
echo "Publish it: drag the netlify-deploy folder onto https://app.netlify.com/drop"
