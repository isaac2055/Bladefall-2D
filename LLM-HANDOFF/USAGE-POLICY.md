# Usage policy — explicit owner request

The owner reported unacceptable credit use and requested minimal context.
The previous goal reported roughly1.79million tokens and11119seconds. This is
aggregate goal accounting, not an itemized tool bill; exact attribution is unavailable.

Observed causes: automatic goal continuations repeatedly reloaded large context;
TAS solver retries and extra validation expanded scope; full suites and screenshots
were repeated; handoffs accumulated chronological updates instead of replacing them;
work continued toward human acceptance that an agent could not supply.
TAS computation itself is local CPU. Model turns, large outputs and repeated
analysis around it consume model usage. Keep the harness; stop using it by default.

Rules for future agents:
- Read the short brief, then targeted searches. Never ingest the whole handoff.
- No new persistent goal unless explicitly requested. No autonomous continuation
  toward human playtest approval; deliver the implementation and ask for feedback.
- Default to one implementation pass and one focused validation pass.
- Do not run a generic bot, search input sequences, or rebuild victory policies
  unless the user specifically asks or a concrete blocker requires it.
- Run a broad suite once only when justified. Do not rerun it for docs/visual edits.
- Bound diagnostics, summarize output, stop after the relevant evidence is obtained.
- Update current facts in place. Do not append another history chapter every turn.
- Preserve historical evidence without presenting it as verification of new gameplay.
