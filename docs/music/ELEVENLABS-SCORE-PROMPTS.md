# Bladefall score — ElevenLabs Music prompts, levels 01–14

Written 2026-09-19. One paste-ready prompt per campaign level, The Outskirts → The Abyss
King, plus an optional boss-cue prompt for each of the seven boss levels (the engine's
`LEVEL_MUSIC` table in `public/index.html` already supports a nested `boss:` cue per level).

**Status (2026-09-20): the score is complete and in the game.** All 23 tracks were
generated with Music v2.5 and wired up: the 21 of the first pass (14 levels, 6 boss cues,
1 approach cue), plus "Engine of the Frozen Garrison" and "Chasing Daylight on Broken
Rails" from section 6. Every playable stage now has its own music; nothing falls back to
the legacy `music.mp3`.
Title-to-stage mapping: `public/audio/ATTRIBUTION.md`. Regenerating a track means replacing
its file in `public/audio/music/` after the same preparation: trim digital silence at the
head and tail, then normalise to −21 LUFS for exploration or −18 LUFS for a boss.

Level facts (theme, acts, symptoms, boss correspondences) were read from
`public/bladefall-campaign.js`, `public/bladefall-story.js` and
`LLM-HANDOFF/02-MASTER-VISION.md` on the date above.

---

## 1. Research summary — prompting ElevenLabs Music

Checked against ElevenLabs' own docs on 2026-09-19 (sources at the end of this section).

**What the model listens to**

- **Five things to decide, or the model decides for you:** genre, mood, instrumentation,
  tempo, production character. Every prompt below states all five.
- **Concrete musical terms audibly change the output** — the docs cite "130 BPM" and
  "in A minor". Stating the key also improves harmonic consistency. Every prompt gives
  BPM, key and (where unusual) metre.
- **Name specific instruments; prefix "solo" to isolate one.** Hence "solo cello" everywhere.
- **Studio vocabulary shifts the mix** ("tape saturation", "close-mic'd", "plate reverb").
  The score's fever haze is asked for in exactly those terms (tape-warble, hall reverb).
- **You can narrate the arrangement in order, and timing cues work** ("start with just…,
  add … after four bars"). Every prompt has a *Structure* sentence that does this.
- **Contradictory modifiers muddle the result** ("energetic but calm"). Where a level has
  two feelings, the prompts give them to *different instruments or different sections*
  rather than to the whole track.

**Instrumental-only**

- Write "instrumental only" in the prompt — otherwise the model may add vocals because the
  genre usually has them.
- API: `force_instrumental: true` guarantees it (prompt mode only, not composition plans).
- UI: also put `vocals, lyrics, singing, choir` in **Exclude styles**. The docs say to use
  negative styles liberally; in-prompt negatives ("no melody — just drums") appear in the
  official examples, so the "No vocals…" tail is legitimate, not superstition.

**Length and models**

- API `music_length_ms` accepts 3 s–10 min; one overview page still says 5 min. All tracks
  here are 2:30–4:00, inside both. Community reports say quality can drift on long
  generations, which is another reason not to go past 4:00.
- Use the newest model offered (`music_v2_5` at time of writing — better prompt adherence).
- No documented prompt length limit for compose. These prompts are long by design (they
  carry the arc and the loop contract); if adherence gets muddy, cut the *Mood* sentence
  first — never BPM, key, instruments or the tail.

**Composition plans** (when a prompt gets the sound right but the shape wrong): up to 30
chunks of 3–120 s, each with a `[Section]` label, `positive_styles`, `negative_styles`, and
a duration. The first chunk sets the tone for the whole piece. For a loop: no Intro/Outro
chunks, put `fade out, outro, ending, vocals` in negative styles, and `constant tempo` in
positive styles. Remember `force_instrumental` does not apply here — use negative styles.

**Copyright filter:** naming a band, musician or copyrighted lyrics returns `bad_prompt`
with a suggested rewrite. Nothing official about game titles; describing the musical
attributes is the safe route, and none of the prompts below name any artist or game.

**Looping:** Eleven Music has no loop toggle. "Seamless loop" in a prompt is creative
direction, not a guarantee. Reliable practice: fix the BPM (so bar arithmetic is exact),
generate a little longer than needed, trim both ends to bar lines in an editor such as
Audacity, add a short equal-power crossfade, and listen to the join on repeat.

**Iterate cheaply:** credits burn fast. Audition a 30-second generation of a prompt to
check the *palette*, then generate full length.

Sources:
[best practices](https://elevenlabs.io/docs/overview/capabilities/music/best-practices) ·
[compose API](https://elevenlabs.io/docs/api-reference/music/compose) ·
[composition plans](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/music/composition-plans) ·
[Music product page](https://elevenlabs.io/docs/eleven-creative/products/music) ·
[help-center prompting FAQ](https://elevenlabs.io/docs/help-center/product/core-capabilities/music/are-there-any-best-practices-for-prompting-eleven-music) ·
[fal.ai prompt guide](https://fal.ai/learn/biz/eleven-music-prompt-guide) ·
[AI game-level loops](https://www.musegen.ai/blog/ai-game-level-music) ·
[metroidvania audio deep-dive](https://www.thegameaudioco.com/the-power-of-sound-design-and-music-in-modern-metroidvania-indie-games-a-deep-dive-of-blasphemous-2-hollow-knight-and-nine-sols)

## 2. Research summary — game-score conventions applied here

- **One theme per place, not per moment.** Metroidvania scores give each region its own
  cue and let the *region's* identity carry it (instrument family, tempo, register). The
  master vision already rules that a level keeps one exploration cue through checkpoints;
  the prompts below are written as long, low-fatigue loops for that reason.
- **Exploration music sits under the player; boss music sits on top.** First-time regions
  last 25–45 minutes, so exploration cues must survive 8–12 repeats: moderate tempo, no
  shrill lead, no big cadences, melody that comes and goes. Boss cues are short (a fight is
  2–5 minutes), so they can be dense, loud, rhythmic and melodic from bar one.
- **Escalate across the whole game, with valleys.** A straight ramp is exhausting. The
  standard shape is a rising sawtooth: each boss peaks higher than the last, and the level
  after a boss drops back down (but not as far as before). Frostfell is this score's big
  valley before the heat/void climb.
- **Escalate inside each track too.** Start sparse → add rhythm → add the full theme → thin
  out to the opening texture so the loop point is invisible.
- **Unify with palette and harmony, because an AI generator cannot reliably repeat a
  melody across separate generations.** A real composer would use a leitmotif. Here the
  glue is: (a) a home key family (D minor and its neighbours), (b) a core ensemble that
  appears in every track, (c) three recurring "fever signatures" (below).
- **Match material to place.** Wood and nylon strings for forest, iron and chain for the
  causeway and gaol, glass and celesta for frost, anvils and brass for the forge, reversed
  and mirrored sounds for the void.
- **Boss music commonly shares DNA with its level.** Each boss cue below reuses its level's
  key and signature instruments at a higher tempo, so the transition feels like the place
  turning on you rather than a different album starting.

### Bladefall's score identity

The knight is poisoned and dreaming; the world is a military fever-delirium. The score is
**dark-fantasy chamber music heard through a fever**: intimate acoustic instruments, slightly
wrong.

- **Core ensemble (in every track):** solo cello (the knight), felt piano, low strings.
- **Fever signatures (one or more in every track):**
  1. a slow, soft **heartbeat-like low drum pulse** (the real body in the tent — it races in
     the Updrafts, skips in the Inversion, nearly stops for the King);
  2. a **detuned music box / celesta ticking figure** (the clocks stuck at 3:40);
  3. **tape-warble / pitch-drift haze** on sustained notes (the delirium itself).
- **Military thread:** field snare and low brass creep in as the dream's chain of command
  becomes legible — absent in level 1, faint by the Warden, overt for the Void Tyrant
  (the officer) and the Abyss King (the commander who gave the order).

### The arc at a glance

| # | Level | Type | Key | BPM | Intensity | Signature colours | Length |
| ---: | --- | --- | --- | ---: | :---: | --- | --- |
| 01 | The Outskirts | explore | D minor | 66 | 2/10 | felt piano, solo cello, music box, night wind | 3:30 |
| 02 | Black Woods | explore | D dorian | 78 | 3/10 | nylon guitar, harp, clarinet, wood percussion | 3:30 |
| 03 | Broken Causeway | mini-boss | G minor | 92 | 5/10 | chains, anvil, low brass, cello ostinato | 3:30 |
| 04 | The Updrafts | explore | F major / D minor | 108 (6/8) | 4/10 | wooden flutes, hammered dulcimer, soaring strings | 3:00 |
| 05 | Hollow Marksman | mini-boss | E minor | 84 | 5/10 | baritone guitar, pizzicato, one held high string | 3:30 |
| 06 | Ruined Keep | explore | B♭ minor | 72 | 4/10 | harp, distant bells, chamber organ, viola | 4:00 |
| 07 | The Warden | mini-boss | C minor | 80 | 6/10 | pipe organ pedal, iron percussion, contrabass march | 3:30 |
| 08 | Frostfell | explore | A minor → C major | 70 | 3/10 | celesta, glass harmonica, warm strings arriving | 4:00 |
| 09 | Frost Sorcerer | mini-boss | F♯ minor | 96 (3/4) | 7/10 | harpsichord, glass bells, tremolo strings | 3:30 |
| 10 | Emberdeep | explore | D minor | 100 | 7/10 | clockwork percussion, anvils, hurdy-gurdy, low brass | 3:30 |
| 11 | Ember Colossus | mini-boss | D minor | 120 | 8/10 | taiko, brass, distorted cello, forge hammers | 3:30 |
| 12 | The Inversion | explore | C♯ minor | 88 (7/8) | 7/10 | reversed piano, mirrored arpeggios, sub bass | 3:30 |
| 13 | The Void Tyrant | mini-boss | D minor | 132 | 9/10 | field snare, pipe organ, hybrid orchestra | 3:30 |
| 14 | The Abyss King | final boss | D minor | 144 | 10/10 | full orchestra, organ, every fever signature | 4:00 |

---

## 3. How to use these prompts

1. Turn the **Instrumental** toggle on (API: `force_instrumental: true`). Every prompt also
   says "instrumental only" as a belt-and-braces measure. In the UI, add
   `vocals, lyrics, singing, choir, fade out` to **Exclude styles**.
2. Set the length shown in each heading. Paste the prompt unchanged.
3. Generate 3–4 variants per level, pick the one that *starts quietly and ends in the same
   texture it started with* — that is the one that will loop.
4. If a variant has the right sound but the wrong shape, keep it and use section editing /
   the composition plan to fix the offending section rather than re-rolling the whole track.
5. Trim to a bar boundary in an audio editor, export **.ogg** (the game's `<audio loop>`
   gaps on .mp3 because of encoder padding; .ogg loops cleanly), and swap the `src` in
   `LEVEL_MUSIC`.
6. Loudness: normalise all 14 to the same integrated level (about −16 LUFS) and let the
   existing per-cue `gain` values handle the rest, so exploration never out-shouts a boss.

**Shared tail.** Every prompt ends with the same three sentences on purpose — they are the
loop and no-vocals contract. If you rewrite a prompt, keep them.

---

## 4. The fourteen prompts

### 01 — The Outskirts · exploration · 3:30

*Waking unarmed at a broken camp-edge at night. Painful light, warm ash, nobody there.
The quietest track in the game; the score's palette is introduced one instrument at a time.*

```text
Instrumental only dark fantasy video game exploration music, 66 BPM, D minor, sparse and intimate. Felt piano playing slow hesitant single notes with long silences, a lonely solo cello melody that enters late and never fully resolves, a slightly detuned music box ticking a small repeating figure like a stopped clock, a very soft slow heartbeat-like low drum pulse, faint night wind and tape-warble haze on the sustained notes. Mood: waking alone in a strange field at night, mysterious, fragile, restrained, quietly uneasy but not frightening. No percussion beyond the soft pulse, no big climax. Structure: begins almost silent with piano alone, cello joins after 40 seconds, low strings swell gently in the middle, then thins back to piano and music box. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 02 — Black Woods · exploration · 3:30

*First refuge, the Oathblade recovered in its own clearing, a voice calling his name beyond
the trees. Time feels stretched. Warmer than level 1 — this is where the player first gets to
fight back — but the forest bites.*

```text
Instrumental only dark fantasy video game forest exploration music, 78 BPM, D dorian, warm but watchful. Fingerpicked nylon-string guitar and harp trading a gentle rolling pattern, a woody clarinet carrying a wandering folk-like melody, solo cello answering underneath, soft wooden percussion and a light frame drum, felt piano touches, a slow heartbeat-like low pulse far in the background, subtle tape-warble so held notes drift slightly in pitch as if time is stretching. Mood: moonlit old forest, curiosity and cautious hope, a small ceremonial swell of noble warmth in the middle like finding a lost sword, with shadows at the edges. Structure: starts with guitar and harp alone, clarinet melody enters, strings lift into a warm brief high point around two thirds through, then settles back to guitar and harp. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 03 — Broken Causeway · mini-boss level (the Brute) · 3:30

*Badlands, stopped machinery, chains and a counterweight. Symptom: compulsive repetition.
The Brute is "the hands" — the soldier who held him down. The first track with real weight.*

```text
Instrumental only dark fantasy video game music for a ruined industrial causeway, 92 BPM, G minor, heavy and obstinate. A stubborn repeating cello and contrabass ostinato that refuses to change, slow anvil strikes and rattling iron chains used as percussion, deep frame drums, low brass swells like something huge shifting its weight, felt piano in the low register, a detuned music box figure ticking faintly, a steady heartbeat-like low pulse. Mood: abandoned war machinery in dry badlands, dread of something large and patient ahead, grim determination, compulsive repetition. Structure: begins with distant chains and the bare ostinato, drums and anvil join, low brass builds to a dark heavy peak in the final third, then strips back to the bare ostinato and chains. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Brute · 2:30**

```text
Instrumental only dark fantasy video game boss battle music, 138 BPM, G minor, brutal and charging. Pounding taiko and floor toms in a relentless galloping rhythm, anvil hits and chain rattles on the off-beats, aggressive staccato cello and contrabass ostinato, snarling low brass stabs, a fierce solo cello lead line. Mood: a huge armoured brute charging again and again, physical danger, stubborn repetition, dodge and punish. Full intensity from the first bar, a short breakdown to drums and chains in the middle, then the full theme returns harder. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 04 — The Updrafts · exploration · 3:00

*Open canyon air, authored currents, a flight maze, kite terraces, a clean bandage tied above
the wind. Symptom: racing pulse. The score's first real lift — relief after the Brute.*

```text
Instrumental only fantasy video game music for soaring through a windy canyon, 108 BPM, 6/8 time, F major leaning to D minor, airy and uplifting with a nervous flutter. Rippling hammered dulcimer and harp arpeggios like rising air, breathy wooden flutes and pan flute carrying a gliding melody, soaring high strings, solo cello countermelody, light hand drums and shakers, and a quick fluttering heartbeat-like low pulse that races under everything. Mood: weightless flight on warm updrafts, freedom and exhilaration, wide open sky, a thread of breathless anxiety beneath the joy. Structure: starts with dulcimer arpeggios and wind alone, flutes enter, strings lift into a soaring peak in the middle, a calm gliding passage, then returns to dulcimer arpeggios. Seamless loop for a game level: steady tempo throughout, ends in the same light texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 05 — Hollow Marksman · mini-boss level · 3:30

*An abandoned watch road under a sniper's eye. Symptom: missing faces. The Marksman is "the
sentry" — the watchman who let them in. Music about being seen: space, stillness, one held note.*

```text
Instrumental only dark fantasy video game music for crossing open ground watched by a hidden marksman, 84 BPM, E minor, tense, sparse and dusty. A lone baritone acoustic guitar playing slow deliberate notes with wide gaps, quiet string pizzicato like careful footsteps, one very high sustained violin note held like a drawn bowstring that appears and vanishes, soft ticking rim clicks like a rangefinder, solo cello in short cautious phrases, felt piano echoes, a slow heartbeat-like low pulse, faint canyon wind. Mood: being watched from far away, exposed, holding your breath, a lonely abandoned road slipping between memory and dream, faces you cannot recall. Structure: begins with guitar and wind only, pizzicato and ticking enter, tension tightens with low string tremolo toward the end without ever exploding, then releases back to the lone guitar. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Hollow Marksman · 2:30**

```text
Instrumental only dark fantasy video game boss battle music, 126 BPM, E minor, taut and precise. Driving muted baritone guitar ostinato, sharp rim clicks and tight snare like a ticking rangefinder, fast string spiccato runs, sudden whip-crack accents followed by one bar of near silence like a shot being lined up, a high sustained violin note that snaps into a fierce solo cello melody. Mood: a duel with a sniper, stop-start tension, bursts of sprinting between cover, cold focus. Structure: tense from the first bar, alternating coiled quiet bars and explosive bars, biggest statement of the theme in the last third. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 06 — Ruined Keep · exploration · 4:00

*Displaced rooms, a fallen keystone, a split belfry, an archive clinging to a wall. Symptom:
amnesia. A keep remembering its own shape — melodies should start, lose the thread, and
find it again.*

```text
Instrumental only dark fantasy video game music for exploring a ruined castle keep, 72 BPM, B-flat minor, hushed, stony and melancholy. Harp and felt piano sharing a courtly melody that keeps trailing off mid-phrase and restarting as if half remembered, a soft chamber organ pad like cold air in a stone hall, a warm viola and solo cello duet, distant cracked tower bells, a detuned music box ticking a small figure, a slow heartbeat-like low pulse, long natural stone-hall reverb with tape-warble haze. Mood: faded grandeur, quiet masonry, amnesia, rooms out of place, sadness with dignity, wonder at what this place used to be. Structure: begins with harp fragments and reverb alone, organ pad and viola join, the full melody is finally played complete once near the three-quarter mark with low strings, then fragments again. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 07 — The Warden · mini-boss level (the Gaol) · 3:30

*Descending a prison from its crown: sentence well, red court, turning cells, a hush engine.
The Warden is "the gate" — the guard who would not look. First clearly military colour:
a slow, judicial march.*

```text
Instrumental only dark fantasy video game music for descending into a vast prison, 80 BPM, C minor, cold, measured and oppressive. A slow deliberate march on contrabass and low cello, deep pipe organ pedal notes, iron percussion of clanking keys, cell doors and a single heavy gavel-like drum on the downbeat, a muffled field snare far away, solo cello playing a stern restrained melody, low brass in quiet chorale chords, a detuned music box faintly ticking, a slow heartbeat-like low pulse, distant machinery hum. Mood: a judge who has already decided, shielded jailers, cells turning out of sight, controlled menace, patience rather than rage. Structure: begins with the low march and iron sounds alone, organ and brass chorale enter, grows to a grave weighty peak in the last third, then returns to the bare march. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Warden · 2:30**

```text
Instrumental only dark fantasy video game boss battle music, 112 BPM, C minor, heavy, stern and ritualistic. A pounding half-time march with huge gavel-like drum hits, iron clangs and marching field snare, thunderous pipe organ chords, low brass fanfare figures, relentless cello and contrabass ostinato, a commanding solo cello theme. Mood: fighting an immovable shielded warden who delivers a measured sentence, wait for the opening then strike back, weight and authority. Full power from the first bar, a brief hushed passage of snare and organ pedal in the middle, then the theme returns at full weight. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 08 — Frostfell · exploration · 4:00

*A frozen settlement; the player relights permanent hearths and warmth returns to abandoned
homes. Symptom: cold sweat. The score's deliberate valley — the most beautiful and humane
track — before the long climb through fire and void.*

```text
Instrumental only fantasy video game music for a frozen village slowly coming back to life, 70 BPM, beginning in A minor and warming toward C major, delicate, still and tender. Celesta and glass harmonica playing crystalline slow notes, felt piano, soft shimmering high string harmonics like frost, then a warm string section with solo cello and a gentle wooden flute arriving like firelight, light sleigh-bell and soft brushed frame drum, a slow heartbeat-like low pulse, faint snow wind. Mood: snowbound silent streets, loneliness turning to comfort, hearth fires being lit one by one, bittersweet hope, a rest before hardship. Structure: begins cold and sparse with celesta and glass alone, warm strings and cello enter near the one minute mark, grows to a glowing gentle high point in the middle, then cools gradually back to celesta and glass. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 09 — Frost Sorcerer · mini-boss level (the White Court) · 3:30

*A sluice, a glassworks, a petition gallery, hushed glass halls and an absent court. Symptom:
numbing. The Sorcerer is "the apothecary" — the soldier who mixed the draught. Elegant,
poisonous, ceremonial: a frozen waltz.*

```text
Instrumental only dark fantasy video game music for a frozen royal court of glass, 96 BPM, 3/4 waltz time, F-sharp minor, elegant, icy and sinister. A brittle harpsichord playing an ornate courtly waltz, glass bells and celesta doubling the melody, shivering tremolo high strings, pizzicato low strings keeping the waltz step, solo cello with a seductive poisonous countermelody, felt piano in the high register, a detuned music box figure, a slow numb heartbeat-like low pulse, cold hall reverb. Mood: a beautiful ceremony with no guests, aristocratic menace, cold magic, numbness spreading, something medicinal and wrong under the elegance. Structure: begins with music box and harpsichord alone, the waltz assembles instrument by instrument, swells to a grand swirling sinister peak in the final third, then empties out to harpsichord and glass bells. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Frost Sorcerer · 2:30**

```text
Instrumental only dark fantasy video game boss battle music, 144 BPM, fast 3/4 time, F-sharp minor, virtuosic, icy and unhinged. A frantic harpsichord and celesta waltz at dangerous speed, racing string runs and shivering tremolo, sharp glass-shatter percussion accents, driving timpani and low string stabs on the downbeat, a furious solo cello theme, sudden harmonic lurches as if the ceremony is fracturing. Mood: a duel with a court sorcerer in a hall of breaking glass, dazzling and cruel, elegance coming apart. Full intensity from the first bar, a short eerie music-box interlude in the middle, then the waltz returns faster-feeling and more fractured. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 10 — Emberdeep · exploration · 3:30

*A buried forge that never stopped running: cooling road, pour schedule, a held bridge over a
live furnace. Symptom: fever rising. Returns to the home key, now hot. Mechanical,
timetabled, sweating.*

```text
Instrumental only dark fantasy video game music for an underground volcanic forge that never stopped running, 100 BPM, D minor, hot, mechanical and driven. Interlocking clockwork percussion of ticking gears, ratchets and metal taps keeping strict time, rhythmic anvil strikes, a droning gritty hurdy-gurdy, low brass heaving like bellows, a pulsing low cello and contrabass ostinato, solo cello melody straining upward in slow climbing phrases, felt piano low octaves, an insistent heartbeat-like low pulse slightly too fast, heat-shimmer tape-warble on the sustained notes. Mood: oppressive heat, a rising fever, machinery working to a schedule nobody remembers, urgency and endurance. Structure: begins with clockwork ticking and drone alone, anvils and ostinato lock in, brass and cello climb to a sweltering peak in the final third, then drops back to ticking and drone. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 11 — Ember Colossus · mini-boss level (the Foundry) · 3:30

*Receiving floor, casting line, the anvil, mould hall, casting pit — a works that is still
pouring. The Colossus is "artillery" and, in reality, the fever's peak. Emberdeep's palette
made enormous.*

```text
Instrumental only dark fantasy video game music for the approach to a colossal living foundry, 120 BPM, D minor, massive, molten and relentless. Thundering taiko and giant forge-hammer impacts, anvil strikes in a driving rhythm, clockwork metal ticking underneath, growling distorted cello and contrabass riff, blazing low brass and horns in slow powerful chords, a gritty hurdy-gurdy drone, solo cello crying out over the top, a pounding fast heartbeat-like low pulse, heat-shimmer pitch drift on the sustained brass. Mood: the peak of a fever, walking toward an artillery-sized giant of molten metal, awe and dread, unstoppable industrial power. Structure: begins with distant hammer impacts and ticking, the riff and drums build in layers, erupts into a towering brass-led peak in the final third, then collapses back to hammer impacts and ticking. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Ember Colossus · 3:00**

```text
Instrumental only dark fantasy video game boss battle music, 152 BPM, D minor, colossal, fiery and overwhelming. Relentless double-time taiko and forge-hammer percussion, anvil hits on every off-beat, a savage distorted cello and low brass riff, blaring horn calls, racing string ostinato, a desperate heroic solo cello theme fighting above the noise, metallic impacts like cannon fire. Mood: battling a molten giant at the peak of a fever, catching its fire and hurling it back, maximum heat and scale. Full intensity from the first bar, a short tense breakdown of ticking clockwork and low heartbeat pulse in the middle, then an even bigger return with the heroic theme on top. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 12 — The Inversion · exploration · 3:30

*A world that has stopped agreeing which way is down: the fall in, the reversal, a polarity
gauntlet, a drop-lock. Symptom: seizure and time loss. The acoustic world gives way — odd
metre, mirrored lines, sounds running backwards.*

```text
Instrumental only dark fantasy video game music for a void where gravity keeps flipping, 88 BPM, 7/8 time, C-sharp minor, disorienting, weightless and uncanny. Reversed felt piano notes swelling backwards into their attacks, a harp and celesta arpeggio that climbs then immediately mirrors itself downward, deep sub bass drones, glassy bowed metal and synthetic void pads, solo cello sliding between notes with slow glissando, a detuned music box figure that stutters, a heartbeat-like low pulse that skips beats irregularly, sudden one-beat dropouts to silence, heavy tape-warble and pitch drift. Mood: upside-down and unmoored, lost time, a mind losing its grip on which way is up, eerie beauty with vertigo. Structure: begins with reversed piano and drone alone, mirrored arpeggios and skipping pulse enter, thickens to a dizzying swirling peak in the final third with cello high above, then inverts back to reversed piano and drone. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 13 — The Void Tyrant · mini-boss level (the Paradox Citadel) · 3:30

*A citadel that keeps three answers to the same question; a barrage that accelerates with
every success. Symptom: lucid recognition. The Tyrant is "the right hand" — the officer who
led the night attack. The dream becomes legible here, so the military thread finally steps
forward: this is an officer's music.*

```text
Instrumental only dark fantasy video game music for storming a paradoxical void citadel commanded by a ruthless officer, 132 BPM, D minor, urgent, militaristic and grand. A crisp relentless field snare march with rolling military cadences, driving staccato string ostinato in three stacked layers low middle and high, thunderous pipe organ chords, commanding low brass and horn fanfares, deep sub bass and dark synthetic void pads beneath the orchestra, mirrored harp arpeggios, a resolute solo cello theme that finally sounds clear and certain, a fast steady heartbeat-like low pulse. Mood: sudden terrible clarity, recognising the enemy's face, a disciplined assault that keeps accelerating in density, resolve hardening into fury. Structure: begins with lone snare and low organ pedal, the three string layers enter one at a time, brass fanfares drive to a huge commanding peak in the final third, then cuts back to lone snare and organ pedal. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional boss cue — the Void Tyrant · 3:00**

```text
Instrumental only dark fantasy video game boss battle music, 156 BPM, D minor, ferocious, militaristic and paradoxical. Rapid-fire field snare and pounding orchestral percussion, machine-like staccato strings in three interlocking layers, massive pipe organ and low brass, dark pulsing synth bass, harp and celesta arpeggios that mirror themselves, barrages of percussion hits that grow denser every phrase, a fierce resolute solo cello and horn theme. Mood: duel with the officer who led the night attack, an accelerating barrage, cold military precision against desperate resolve. Full intensity from the first bar, a brief suspended passage of reversed piano and organ pedal in the middle like time looping, then the densest and most forceful statement of the theme. Seamless loop for a game boss fight: steady tempo throughout, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

### 14 — The Abyss King · final boss · 4:00

*Void procession, crown threshold, royal echo arena. Symptom: unconsciousness. The King is
the unseen commander who gave the order, and the knight believes beating him is the only way
to wake. Everything the score has introduced returns: the cello, the music box, the
heartbeat, the snare, the organ. It opens like level 1 — and then does what level 1 never did.*

```text
Instrumental only epic dark fantasy video game final boss music, 144 BPM, D minor, tragic, colossal and desperate. Opens with twenty seconds of a lone detuned music box, felt piano and a faint slowing heartbeat-like low drum pulse in near silence, then erupts into full symphonic orchestra: thunderous timpani, taiko and field snare, massive pipe organ, blazing brass and horn fanfares, racing string ostinatos, deep sub bass and dark void pads, anvil and glass bell accents, and a heroic sorrowful solo cello theme soaring above everything, with organ and high strings swelling in place of any voices. Mood: the last battle inside a dying dream against an unseen king, regal and terrible, grief and defiance, fighting to wake up, everything at stake. Structure: quiet music box opening, explosive full orchestra entrance, a driving battle section, a hushed middle passage of solo cello, piano and heartbeat pulse, then the largest most triumphant and tragic return of the theme with full organ and brass. Seamless loop for a game boss fight: steady tempo throughout after the opening, ends mid-energy on the main rhythm, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

**Optional approach cue — the Void Procession · 2:30** *(for the walk to the arena, if the
final level gets an exploration/boss split like the other boss levels)*

```text
Instrumental only dark fantasy video game music for a silent royal procession through a black void toward a throne, 60 BPM, D minor, funereal, vast and hollow. Deep pipe organ pedal drone, a very slow muffled funeral drum, a heartbeat-like low pulse that is faint and slowing, a detuned music box figure ticking far away, solo cello playing a long grieving melody with wide silences, felt piano single notes, distant low brass chords like a court assembled in the dark, cavernous reverb and tape-warble. Mood: slipping toward unconsciousness, a last walk, dread and acceptance, regal emptiness. Stays quiet throughout, a slight swell of low brass and organ near the end that recedes again. Seamless loop for a game level: steady tempo throughout, ends in the same quiet texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

---

## 5. If a generation comes out wrong

| Problem | Fix |
| --- | --- |
| Voices / choir appear | Confirm the Instrumental toggle; delete any word that implies voice (*choir, chant, hymn, anthem, sing*); re-roll. |
| Track fades out or ends on a big chord | Re-roll, or cut the last 8 bars and loop from the end of the final quiet section. The "ends in the same texture" sentence raises the hit rate; it does not guarantee it. |
| Too busy for exploration | Delete the peak sentence from *Structure*, add "minimal, lots of space, background music". |
| Too sleepy for a boss | Raise BPM by 8–12, add "aggressive, driving, high energy from the first second". |
| Tempo drifts, so the loop bumps | Add "strict metronomic tempo, no rubato, no tempo changes". |
| Sounds like a different game from its neighbours | Make sure *solo cello*, *felt piano* and the *heartbeat-like low pulse* are still in the prompt — they are the glue. |
| Wants to be a pop/trailer track | Add "underscore, not a song, no drop, no trailer braams". |
| Prompt rejected | Remove any artist, band, composer or game title. None of the prompts above contain one. |

---

## 6. Later additions (2026-09-20)

Three slots were still on old or borrowed music after the first pass. Two need new
tracks; the third was answered by a reprise instead.

**The Gilded Vault** was cut from the campaign on 2026-09-20, so it needs nothing.

### Frostfell, after the Muster Engine · exploration · 4:00

*Frostfell's second cue, replacing the supplied "ClockWork". The player has spent the
region relighting hearths to "Hearthfire in the Frost"; then they press Up on the Muster
Engine, a bell strikes, and the settlement they warmed answers as a military machine —
darker atmosphere, reinforced enemies, the war remembering this place. Same key and much
of the same palette as Hearthfire on purpose: this must sound like the same town turned,
not a different album. Every warm instrument comes back as iron.*

```text
Instrumental only dark fantasy video game music for a frozen settlement waking up as a war machine, 92 BPM, A minor, cold, militarised and ominous. Opens on a single huge bronze bell strike with a long decay, then a low marching field snare, iron and chain percussion, deep boiler-like machine thuds keeping strict time, heavy contrabass and cello ostinato, dark low brass chords like an order being passed down a line, and the earlier warmth returned as metal: celesta and glass bell figures now brittle and mechanical over the march, with high shivering strings. A slow heartbeat-like low pulse, faint tape-warble on the sustained notes, cold hall reverb. Mood: the hearths are still lit but the town is no longer yours, an engine answering for a garrison, dread and momentum rather than panic. Structure: begins with the bell and machine thuds alone, snare and ostinato lock in, low brass builds to a grim heavy peak in the final third, then strips back to bell and machinery. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

Slots into `FROST_MUSTER_MUSIC` in `public/index.html` (currently `clockwork.mp3`).

### The Deep Line · secret truth route · 3:30

*The optional last level, reached only with the seven keys: a minecart run down dangerous
high rails — signal forks, a falling bridge, a sniper clock — ending in a launch across a
black gap that chooses the waking ending. Symptom: the threshold of waking. This is the only
track in the game with real forward hope in it, and the one place the score's own memory pays
off: the Outskirts' music box returns, and the heartbeat that has been faint and dreamlike all
game becomes a real, strong pulse — the knight's actual body, close now. It should feel like
speed toward daylight, with the dream coming apart behind you.*

```text
Instrumental only dark fantasy video game music for a headlong minecart descent along collapsing rails toward waking, 138 BPM, D minor lifting toward D major, urgent, driving and finally hopeful. Relentless galloping low strings and cello ostinato, tight rhythmic iron percussion like rails and wheels, taut field snare, propulsive low brass, a soaring solo cello and high string melody that keeps climbing in steps, a detuned music box figure from far back in the story ticking against the rhythm, and a strong steady heartbeat-like low drum pulse that is no longer faint but close and physical. Sudden one-bar drops to almost nothing, like the floor going out, then the full drive returning. Mood: speed, danger and rising hope, a dream coming apart behind you, running toward daylight. Structure: begins with the wheel rhythm and heartbeat alone, ostinato and snare enter, the melody climbs through two rises, and the last third opens into the brightest, most major-sounding statement in the whole score before pulling back to the wheel rhythm. Seamless loop for a game level: steady tempo throughout, ends in the same sparse texture it began with, no fade-out and no final chord. No vocals, no choir, no spoken words.
```

Slots into `LEVEL_MUSIC[15]` in `public/index.html`, which currently falls back to the
legacy `music.mp3`.

### The Throne hall's second boss — answered by a reprise, no new track

The Abyss King's region now holds two fights: the Right Hand (the Void Tyrant, who did not
die in the Citadel) in its middle, and the King at the throne. Rather than a third
composition, the Right Hand brings back **“Iron Oath of the Night Attack”**, his own cue from
the Citadel, under its own id (`king-right-hand`) so it starts from the top instead of
resuming. Recognising him is the encounter, and his theme says that faster than new music
could. Wired 2026-09-20 through a `duel` cue on stage 13; swapping in a dedicated track later
is one `src`.
