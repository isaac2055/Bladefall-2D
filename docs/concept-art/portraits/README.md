# Talking portraits and the Celeste-style conversation box

The owner's ask was for conversations to work like Celeste's:
- a framed box across the top of the screen,
- a close-up of the speaker's face whose mouth moves while the line types out,
- text you can skip,
- the game still visible underneath.

`sheet.png` shows every face and real in-game captures (desktop 1280×720 and mobile landscape 844×390) of Rowan, Elsie, Mara, Bram, Tamsin, Oren, Silas, Orra, and Sable in Act Two. For each one it shows the line mid-typing, the finished line with its choices, and the knight's reply.

## The faces: `public/bladefall-portraits.js`

- **Format:** a 48×48 head-and-shoulders close-up in art pixels, drawn to a canvas and shown with `image-rendering: pixelated`. It is 144 px on desktop, 96 px on smaller screens and 64 px in mobile landscape.
- **Matches the body:** each face uses the same signature colour, headwear, hair and prop as that person's body in `bladefall-resident-art.js`. For example, Rowan has his kettle helm and spear, Oren his spade beard and chain, and the Cartographer his blindfold and ear trumpet.
- **The knight:** navy hood, pale face, cyan eyes and orange scarf.
- **Coverage:**
  - Every side-story giver and supporting speaker.
  - The residents, shopkeepers and travellers.
  - The Act Two speakers: Sable, "the kneeling man" (Oren, bandaged), the woman by the gate, and the servant in the gold mask.
  - Signs, relics, notes and Vey's unattended drawer get no face.
- **Animation:**
  - A blink every 2.4–4.6 s.
  - The mouth cycles through half, open, half and closed at about 12 frames a second while text is revealing. It closes during punctuation pauses and when the line is done.
  - The automaton's visor widens instead, the Figure's eyes flicker, and masked or bandaged faces keep still.
  - The Sleepless Clerk and the Service Keeper yawn.
- **Moods:** `neutral` and `concerned` (the brows lift in the middle and the mouth turns down). The mood is picked from words in the line (hurt, afraid, sorry, gone, cold, …) unless the caller passes `mood`.
- **API:**
  - `resolve(title)` maps a conversation title to a face id, for example `'Tamsin · The Assessor'`, `'OREN · CAUSEWAY CHAINWRIGHT'` or `'THE KNEELING MAN'`.
  - `draw(ctx, id, {blink, mouth, mood})` draws the face.
  - `ids` lists every face; `has(id)` tells whether one exists.

## The box: `public/bladefall-conversation.js`

- **Frame:** a double-ruled box with ornamented corners at the top of the screen. The portrait sits on the speaker's side (the knight on the left, everyone else on the right) with the name above the line.
- **Typewriter:** 48 characters a second, with short pauses on `, ; : —` and longer ones on `. ! ? …`.
  - The full line is in the DOM from the start; the unrevealed part is only transparent, so screen readers and tests see the whole text.
  - Any key, tap or click while the text is typing finishes the line. The next press moves on (a ▼ marks that there is more) or lets you pick a choice.
  - For 0.28 s after a line finishes, Enter and Space are ignored, so a skip-press cannot also pick the first choice.
- **Choices:**
  - They stay in the box, faint while the line types and fully shown once it is done.
  - Arrows and Tab move between them, Enter and Space pick one, and Escape closes the box, as before.
  - Touch scrolling inside the box still works.
  - In mobile landscape they sit in two columns so the world stays visible.
- **The knight replies:** when you pick a spoken choice in a conversation with a person, the next `show()` first plays that line as the knight's own beat (left portrait, "The Knight") before the other speaker answers. This covers `openFieldConversation` and the side stories without changing their code.
- **Camera:**
  - While a person speaks, `#gameContainer` scales to 1.16× and slides so that the pair sits in the clear space below the box, eased over 0.45 s and kept pixel-crisp.
  - Bars 5.5 vh tall slide in at the top and bottom; they ignore pointer input.
  - Everything resets on close. The HUD and touch controls are not transformed.
  - With `reducedMotion` (or the OS setting), text appears at once and the camera does not move.
- **Contract:**
  - `show({title, text, accent, choices, onClose})` still works as before, and `close()` and `voice()` are unchanged.
  - New optional fields: `speaker`, `portrait` (an id, or `null` for no face), `side`, `mood`, and `lines: [{text, speaker|portrait, side, mood}]` for several beats.
  - A text-override hook (`window.BladefallText?.apply`) belongs on the first line of `show()`. Nothing above that point reads `title`, `text` or `lines`.
