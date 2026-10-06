# The Dialogue Editor: editing every line a player reads

Open it from the title screen with **✎ Dialogue Editor**, which opens `public/dialogue-editor.html`.

The editor lists every player-readable string in the game: dialogue and reply choices, object and relic
descriptions, signs, annotations, quest and side-story text, task labels, shop text, toasts and notices,
titles and narration cards, and on-screen prompts. You can filter by place and by kind, search, and see a
typography preview of each line. Edited lines show their original underneath.

- **Save**: edits are stored in this browser's localStorage, separately from the save file, so Full Reset
  does not erase them.
- **Reset** restores one line. **Reset all** restores every line.
- **Export JSON** / **Import JSON** move edits between browsers or hand them to an agent.

## How it works

| Piece | File | Job |
|---|---|---|
| Catalog | `public/bladefall-text-catalog.js` (generated) | Every string: text, kind, place, speaker or owner, and each `file:line` it comes from |
| Generator | `scripts/build-text-catalog.mjs` | Lexes `index.html`'s inline scripts and markup, and every script `index.html` loads |
| Runtime | `public/bladefall-text.js` (`BladefallText`) | Swaps a shown string for its edit at display time |
| Write-back | `scripts/apply-text-edits.mjs` | Puts an exported set of edits into the source |

### How edits are keyed

- **By original text.** The key is `bladefall_text_overrides_v1`: `{byText, parts}`.
- **By id**, for `BladefallDialogue` entries. The key is `bladefall_dialogue_overrides_v1`, unchanged from
  the old editor.
- Identical lines are one entry, and they change together everywhere they appear.
- A catalog *fragment* is a piece of a line built around a live value, such as `QUEST` in
  `QUEST · <title>`. It is replaced wherever it appears as a whole word.

### Where edits are applied

- **Explicit hooks** in the game code:
  - `BladefallConversation.show`: one line at its top, which covers title, text, `lines` and choice labels;
  - `showOutskirtsAnnotation`;
  - `toast`;
  - `showStationNotice`;
  - `showOvHTML`, which covers cards, shops and journals.
- **Catch-alls** that `BladefallText.install()` adds:
  - canvas `fillText`, `strokeText` and `measureText`, which covers stage banners, prompts, floating text
    and labels;
  - a MutationObserver on DOM text, which covers the HUD, menus and cutscene text.
- Matching runs piece by piece:
  1. The whole string.
  2. Each run of text between HTML tags.
  3. Each line.
  4. Each ` · ` part.
- Quotes and ALL-CAPS display are ignored when matching. Originals of 12 or more characters are also
  replaced inside longer strings.
- When there are no edits, everything above is idle.

## After the owner hands over an export

1. `node scripts/apply-text-edits.mjs bladefall-text-edits.json` shows what would change.
2. Run it again with `--write` to apply.
   - Each edit is written at its recorded `file:line`, escaped for that literal's quotes.
   - Anything that moved, is assembled from pieces, or matches in several places is listed for a hand edit.
3. Run `node --check` on the changed files, then run the tests. Tests that pin the old wording need their
   expected strings updated.
4. Run `node scripts/build-text-catalog.mjs` so the catalog lists the new wording.
5. Ask the owner to **Reset all** in the editor. Otherwise the stored edits keep overriding a source that
   now matches them.

Regenerate the catalog whenever text changes. `tests/text-overrides.test.mjs` fails once the catalog trails
the source by more than 10%. `--check` reports whether the file is current. Bump the catalog's `?v=` stamp
(in `sw.js` and in the editor's script tag) on a deploy, as for any other module.

## What cannot be edited

- **Lines assembled at runtime.** When a line is built from a live value, only its fixed pieces can be
  edited, and each piece changes wherever it appears as a whole word.
- **Attribute text**, such as tooltips (`title=`), placeholders and aria labels.
- **The document title and the service-worker offline page.**
- **Strings from modules the game does not load.** Engine-only modules are skipped on purpose:
  `bladefall-release`, `-streaming`, `-charters`, `-harness`, `-authoring` and `-foundation-audit`.
- **Another player's screen in co-op.** Edits live in one browser, so a co-op partner sees their own
  edits.
