# Bladefall

Explore and Survive, with separate Base and Fractured campaigns. Current release: **7.303.0**.

- Run locally: `npm install`, then `npm run serve`.
- Hosting: **Cloudflare Pages with GitHub integration**, publishing `public/` through `wrangler.jsonc`.
- [Pages configuration and separate API deployment](docs/playtest/RELEASE-7.302.md)
- [Playtest features and save transfer](docs/playtest/RELEASE-7.301.md)
- [Current development state](LLM-HANDOFF/01-CURRENT-STATE.md)
- [Room Bank: 97 approved and a 40-world placement plan](docs/room-bank/WORLD-PLACEMENT-7.303.md)

The `main` branch is the deployment source. `public/` contains the game. `cloudflare/` and `server/` contain the scores/private-feedback backend; its original Worker configuration is preserved in `wrangler.worker.jsonc`. The Pages API is not yet connected: online submissions remain queued locally until the backend is provisioned. Local Room Bank/Extras is hidden on public title menus; direct Room Bank review links remain available. World-ending superroom imports are future work; individual room checkpoints remain in place.
