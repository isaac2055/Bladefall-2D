# Bladefall

Explore and Survival, with separate Base and Fractured campaigns. Current release: **7.301.0**.

- Run locally: `npm install`, then `npm run serve`.
- Hosting: **Cloudflare Workers with GitHub integration**, using `wrangler.jsonc`.
- [Cloudflare connection, playtest features and save transfer](docs/playtest/RELEASE-7.301.md)
- [Current development state](LLM-HANDOFF/01-CURRENT-STATE.md)
- [Room Bank Run 7](docs/room-bank/RUN-7.md)

The `main` branch is the deployment source. `public/` contains the game; `cloudflare/` and `server/` provide persistent scores and private feedback. Local Room Bank/Extras is hidden on public hosts. World-ending superroom imports are future work; individual room checkpoints remain in place.
