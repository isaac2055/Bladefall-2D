#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-}"
MODE="${2:-runnable}"

if [[ -z "$DEST" ]]; then
  echo "Usage: $0 /absolute/or/relative/destination [runnable|code]" >&2
  exit 2
fi
if [[ "$MODE" != "runnable" && "$MODE" != "code" ]]; then
  echo "Mode must be 'runnable' or 'code'." >&2
  exit 2
fi

mkdir -p "$DEST"
if find "$DEST" -mindepth 1 -maxdepth 1 -print -quit | grep -q .; then
  echo "Refusing to copy into non-empty destination: $DEST" >&2
  exit 3
fi

copy_path() {
  local path="$1"
  if [[ -e "$ROOT/$path" ]]; then
    mkdir -p "$DEST/$(dirname "$path")"
    rsync -a "$ROOT/$path" "$DEST/$(dirname "$path")/"
  fi
}

for path in package.json package-lock.json build-deploy.sh .gitignore TESTING.md KNOWN_BUGS.md; do
  copy_path "$path"
done
for path in scripts tests deploy-assets .agents LLM-HANDOFF docs/tas/README.md; do
  copy_path "$path"
done

PUBLIC_FILTERS=(--exclude '.DS_Store' --exclude 'index.html.pre-multiplayer.bak')
PUBLIC_DESCRIPTION="canonical public runtime source (binary audio/images omitted)"
if [[ "$MODE" == "code" ]]; then
  PUBLIC_FILTERS+=(--exclude 'audio/' --exclude 'music.mp3' --exclude '*.png')
else
  PUBLIC_DESCRIPTION="canonical public runtime source, audio, and images"
fi
mkdir -p "$DEST/public"
rsync -a "${PUBLIC_FILTERS[@]}" "$ROOT/public/" "$DEST/public/"

mkdir -p "$DEST/docs/charters"
for doc in "$ROOT"/docs/*.md; do
  [[ -e "$doc" ]] && rsync -a "$doc" "$DEST/docs/"
done
for integration in "$ROOT"/docs/charters/*integration*.json; do
  [[ -e "$integration" ]] && rsync -a "$integration" "$DEST/docs/charters/"
done
while IFS= read -r charter; do
  rel="${charter#"$ROOT/"}"
  mkdir -p "$DEST/$(dirname "$rel")"
  rsync -a "$charter" "$DEST/$rel"
done < <(find "$ROOT/docs/charters" -mindepth 2 -maxdepth 2 \( -name charter.md -o -name README.md \) -type f | sort)

# Receipts are compact executable evidence; media beneath the same folders is not.
while IFS= read -r receipt; do
  rel="${receipt#"$ROOT/"}"
  mkdir -p "$DEST/$(dirname "$rel")"
  rsync -a "$receipt" "$DEST/$rel"
done < <(find "$ROOT/docs/charters" -name receipt.json -type f -size -1024k | sort)

cat > "$DEST/WORKING-COPY-MANIFEST.txt" <<EOF
Bladefall Antigravity lean working copy
Created: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Source: $ROOT
Mode: $MODE

Included:
- $PUBLIC_DESCRIPTION
- package manifests, tests, scripts, deploy builder/assets
- compact top-level plans, level charters, and small validation receipts
- complete LLM-HANDOFF guidance

Excluded:
- incomplete Git metadata/history
- node_modules (run npm install)
- generated netlify-deploy (run ./build-deploy.sh)
- historical screenshots, videos, contact sheets, and baseline media
- local editor metadata and pre-multiplayer HTML backup
EOF

echo "Created $MODE Bladefall working copy at $DEST"
du -sh "$DEST"
