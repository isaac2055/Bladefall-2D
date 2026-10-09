- Do not deploy to Netlify (`netlify deploy`) unless explicitly instructed by the user, as they want to save their deployment credits.

- The host is now Cloudflare. After each completed game run/change set, commit and push the current game to isaac2055/Bladefall-2D main, after relevant checks. This is standing user authorization to push; do not force-push or overwrite unrelated remote work. Report the pushed commit. Keep private feedback, tokens and local caches out of Git.
- World-ending superrooms are future Room Bank imports. Preserve individual room checkpoints; do not combine the last rooms under one checkpoint or author/import finales without a new explicit request.
