# Aerth — 13 optimised ElevenLabs Music prompts

Written 2026-09-20, from the Aerth brief and placement plan. Same house style as
`ELEVENLABS-SCORE-PROMPTS.md` (the Bladefall score): 2:30–4:00, loopable where the cue is a
loop, instrumental, prepared the same way afterwards.

Melody reuse across cues is **out of scope** by request, so every prompt below stands on its
own. The set is held together instead by two things a generator can actually honour in a
single prompt: a **key family per region** and a **fixed instrument palette per region**. Play
them back to back and they sound like one score, without any cue needing to quote another.

---

## 0. What was generated (2026-09-20)

All 19 takes, matched to their prompts by length, generation order and title. The four short
cues fire on an event and must not be looped.

| Generated title | Length | Prompt |
| --- | --- | --- |
| Village Vigil | 3:30 | 1. Home Worth Saving — Briar Town |
| The Shore of Broken Ships | 3:30 | 2. Shipwreck Shore |
| Towering Sea Cliffs | 3:30 | 3. Thunder Cliffs |
| White Marble Palace above the Clouds | 3:30 | 4. Palace Above the Clouds |
| Archives of the Archmage | 4:00 | 5. The Sky Library |
| The Fallen Champion Duel | 2:30 | 6. The Fallen |
| Chains of the Deep | 3:00 | 7. Bound by Chains |
| Unburdening the Colossus | 0:45 | 7 — release cue, last chain breaks |
| Navigating the Red Wake | 2:30 | 8. Across the Storm |
| Safe Harbor | 0:30 | 8 — arrival cue |
| The Wayfarer's Hearth | 4:00 | 9. A Place to Return — take A |
| The Waystation Refuge | 4:00 | 9. A Place to Return — take B |
| Hall of the Violet Discipline | 3:00 | 10. Lessons Beyond the Rift — calm, take A |
| The Archive of Violet Portals | 3:00 | 10. Lessons Beyond the Rift — calm, take B |
| Crystalline Trials | 3:00 | 10 — training version, 114 BPM |
| Through the Void Breach | 1:30 | 11A. Beyond the Gate |
| Passing the Flame | 2:00 | 11B. Ian's Promise |
| The Last Spark of Darrow | 1:30 | 11C. Cut the Binding — charge loop |
| The Breaking of the Keeps | 0:30 | 11C — success cue, the cut lands |

Two prompts have alternate takes to choose between by ear: the Waystation pair and the calm
Rift Hall pair. Nothing distinguishes them but the generation.

Not yet prepared: none of these have been trimmed or loudness-matched (section 7).

---

## 1. Settings for every generation

- **Model:** Music v2.5. **Instrumental:** on (API `force_instrumental: true`).
- **Length:** as given per cue. Generate 3–4 takes; keep the one that *starts and ends in the
  same texture* — that is the one that will loop.
- **Exclude styles** — paste this once and leave it in for the whole set:

```text
vocals, lyrics, singing, choir, chanting, spoken word, fade out, outro, trailer music, braams, risers, cinematic impacts, orchestral hits, big finale, EDM drop, sound effects, field recordings
```

Each cue below adds its own exclusions on top. Putting the "don't" list in this field instead
of in the prompt is the single biggest change I made to the drafts: their prompts spent a
third of their words on what to avoid, and every one of those words competed with the musical
instructions for the model's attention.

## 2. The shape of the set

| # | Cue | Role | Key | BPM | Length |
| ---: | --- | --- | --- | ---: | --- |
| 1 | Home Worth Saving | explore loop | D major | 88 | 3:30 |
| 2 | Shipwreck Shore | explore loop | D dorian | 96 | 3:30 |
| 3 | Thunder Cliffs | explore loop | D dorian | 108 | 3:30 |
| 4 | Palace Above the Clouds | explore loop | A major | 76 | 3:30 |
| 5 | The Sky Library | explore loop | A major | 66 | 4:00 |
| 6 | The Fallen | boss loop | B minor | 126 | 2:30 |
| 7 | Bound by Chains | boss loop | D minor | 104 | 3:00 |
| 8 | Across the Storm | action loop | D dorian | 136 | 2:30 |
| 9 | A Place to Return | hub loop | D major | 68 | 4:00 |
| 10 | Lessons Beyond the Rift | hub loop (+ training) | F♯ minor | 72 / 114 | 3:00 each |
| 11A | Beyond the Gate | cinematic | C minor | free, very slow | 1:30 |
| 11B | Ian's Promise | cinematic | D major | 64 | 2:00 |
| 11C | Cut the Binding | pressure loop | D minor → D major | 132 | 1:30 |

**Why those keys.** Home is D major. The sea is D dorian — the same tonic heard through
weather, so the coast feels like the same world seen from a colder angle. The palace lifts to
A major, the brightest key in the set, and the Rift Hall sits in F♯ minor, A major's relative
minor, because that knowledge belongs to the palace's world. The Void drops to C minor, a
semitone *below* home, which is why it sounds wrong in a way players feel before they can name
it. The finale climbs from D minor back to D major: the ending literally returns home.

**Palettes.** Briar and the Waystation: fiddle, wooden flute, plucked strings, hand drums.
The coast: low fiddle, frame drums, plucked strings, breathy flutes. The palace: harp, bells,
warm strings, distant horns. The rift: glass and crystalline percussion over strings. The
bosses take their region's instruments and add war drums and brass.

**Room for dialogue.** Every exploration prompt carries a version of the same clause: keep the
middle of the mix open, melody either high and sparse or low and slow, no dense sustained
midrange, no busy counterpoint. That is what "leave room for voices and footsteps" means in
terms a generator can act on.

---

## 3. The five main-level themes

### 1. Home Worth Saving — Briar Town, part one

*Explore loop · D major · 88 BPM · 3:30*

```text
Instrumental dark fantasy game exploration music for a small farming village quietly preparing to defend itself, 88 BPM, D major, warm, vulnerable and determined. A solo fiddle carries a simple folk melody in four-bar phrases with a gentle lilt, answered by a breathy wooden flute; underneath, fingerpicked acoustic guitar and harp, a soft low string bed, and restrained hand drums and frame drum keeping an easy walking pulse. A single low cello note leans in now and then like worry under the warmth. Mood: an ordinary person's home worth defending — muddy fields, a working mill, neighbours helping each other, courage that is only just beginning and has not won anything yet. Keep the middle of the mix open for dialogue and footsteps: melody high and sparse, no dense sustained pads, no busy counterpoint. Structure: begins with solo fiddle and guitar, flute answers after about 40 seconds, hand drums and low strings fill out a steady middle section, then thins back to fiddle and guitar. Seamless loop for a game level: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `brass, war drums, heroic fanfare, triumphant, marching`

**Variants:** for Thomas/Mara conversations and character creation, run the same prompt with
"solo fiddle and guitar only, no drums, half the density" added and 2:00 length. For the
defensive encounters, add "add urgent low frame drums and driving low strings under the same
melody, 100 BPM".

### 2. Shipwreck Shore — Storm Coast, part one

*Explore loop · D dorian · 96 BPM · 3:30*

```text
Instrumental fantasy coastal exploration music for a shore of broken ships, hidden cargo and survivors repairing a boat, 96 BPM in a swaying 6/8, D dorian, resourceful, curious and weather-beaten. Plucked strings and bouzouki-like strumming set an uneven nautical sway, a low fiddle carries a modal melody with a salt-worn edge, a wooden flute answers in the gaps, and light frame drums and rope-and-timber wooden percussion keep the roll. A low drone underneath like a swell that never settles, and distant low brass once or twice at the horizon. Mood: scrappy seaside problem-solving, searching and repairing, adventure with real danger past the breakers — not a tavern celebration. Keep the middle of the mix open for dialogue and footsteps: no dense sustained pads, no busy counterpoint. Structure: opens with plucked strings and the drone, fiddle melody enters, drums and flute build a steady working middle, then falls back to plucked strings and drone. Seamless loop for a game level: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `sea shanty, pirate jig, accordion, comedic, drinking song, whistling`

### 3. Thunder Cliffs — Storm Coast, part two

*Explore loop · D dorian · 108 BPM · 3:30*

```text
Instrumental fantasy exploration and climbing music for towering sea cliffs on a remote island, 108 BPM, D dorian, exposed, effortful and full of discovery. Rising string lines that climb in long steps, breathy wooden flutes and low whistle over them, plucked strings still audible from the shore below, and low toms and timpani pulsing like thunder a long way off. A dark low string undertone sits beneath bright high notes the whole time. Alternate wide open spacious phrases for the long views with short urgent clipped passages for narrow ledges and wind-blown crossings. Mood: the sea far below, a beautiful palace high above, danger and wonder in the same breath — sustained traversal, not a battle. Keep the middle of the mix open for dialogue and footsteps. Structure: begins with distant drums and a single climbing string line, flutes and full strings gather through the middle, one brief hush near the end, then returns to the opening climbing figure. Seamless loop for a game level: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `relentless pounding, battle music, double kick, heroic finale, triumphant resolution`

### 4. Palace Above the Clouds — Sunspire Palace, part one

*Explore loop · A major · 76 BPM · 3:30*

```text
Instrumental fantasy exploration score for an immense white marble palace above the clouds, once a seat of sacred knowledge and now held by an occupying army, 76 BPM, A major, beautiful, wise and quietly wounded. Harp figures and delicate tuned bells lead, warm strings carry a graceful welcoming melody, distant horns answer softly from far off down the halls, and restrained low percussion marks slow time underneath. Under the beauty, low strings hold notes that do not quite agree with the melody, so the peace sounds disturbed rather than broken. Mood: hanging gardens, sunlit courts, guarded balconies, survivors reclaiming their home — dignity under occupation. Keep the middle of the mix open for dialogue, puzzles and footsteps: melody high and sparse over a slow low bed, no dense sustained pads. Structure: opens with solo harp and one bell, strings bring in the melody, horns and low percussion widen it through the middle, then returns to harp and bell. Seamless loop for a game level: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `church organ, hymn, sacred choral, military march, victory fanfare, cathedral`

### 5. The Sky Library — Sunspire Palace, part two

*Explore loop · A major · 66 BPM · 4:00*

```text
Instrumental fantasy library exploration music for enormous shelves, ancient books, dust floating in golden light and walkways curving around a vast central hall, 66 BPM, A major, hushed, wondering and secretive. Soft repeating harp patterns, high string harmonics that shimmer without vibrato, a low warm string bed, occasional single clear bell notes ringing into the space, and one distant soft flute line. Mild tension from the guards outside: a low string note that holds a little too long, once a minute. Mood: important knowledge just out of reach, careful quiet exploration, awe rather than grief or dread. Very slow harmonic movement, long phrases, generous silence between ideas. Keep the mix open and uncluttered for reading and conversation: no drums, no dense pads, no busy counterpoint. Structure: harp and one bell alone, high harmonics enter, the warm low bed and flute arrive in the middle, then it empties back to harp and bell. Seamless loop for a game level: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `horror, dissonant, mournful, grief, heavy drums, percussion, suspense stingers`

**Variant:** for the question room and the orb, rerun with "harp and single bell notes only,
very long pauses, one low glassy drone underneath, almost nothing happening" at 2:30.

---

## 4. Two bosses and the crossing

### 6. The Fallen — Ruined Keep boss

*Boss loop · B minor · 126 BPM · 2:30*

```text
Instrumental dark fantasy boss battle music for a close duel with a disciplined fallen champion in a ruined indoor hall, 126 BPM, B minor, tense, controlled and dangerous. Tight staccato low strings drive a lean repeating figure, sharp short high string answers cut across it, measured war drums and taiko mark the exchanges, and restrained low brass swells behind. A solo viola carries a brief sorrowful line twice in the piece: this fighter was a person once. Emphasise timing, tension and sudden openings — a duel between skilled opponents, not a lumbering giant. Leave space between phrases for attack warnings and weapon impacts: gaps in the rhythm, nothing sustained in the midrange. Structure: full intensity from the first bar, a tighter stripped-back passage of drums and low strings in the middle, then a harder and more insistent variation of the main figure for the last third. Seamless loop for a game boss fight: strict steady tempo, no rubato, ends mid-energy on the main rhythm, no fade-out, no final chord and no victory ending. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `slow intro, ambient opening, comedic, playful melody, monster roars, triumphant ending`

### 7. Bound by Chains — Storm Coast hydra

*Boss loop · D minor · 104 BPM · 3:00*

```text
Instrumental fantasy boss battle music for an enormous chained multi-headed sea creature thrashing against storm cliffs, 104 BPM with heavy accents, D minor, frightening and sorrowful at once. Deep taiko and low toms in rolling waves, surging low strings, strained metallic percussion like chain links under tension, and powerful dark brass in slow heaving chords. Over it a mournful cello melody that sounds like pain rather than malice — this creature is trapped and defending itself, not a tyrant. Build pressure in swells that rise and fall, leaving clear breathing spaces between them for attack tells and impacts. Structure: begins mid-storm with drums and chain percussion, the cello melody enters over the first swell, pressure grows through the middle, one near-silent trough two thirds through, then the heaviest swell of all. Seamless loop for a game boss fight: strict steady tempo, no rubato, ends mid-energy on the main rhythm, unresolved, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `evil villain theme, triumphant monster kill, heroic fanfare, comedic, victory ending`

**Release cue** (separate 0:45 generation, for the last chain breaking):

```text
Instrumental fantasy cinematic release, 70 BPM, D minor resolving into D major, grief turning to relief. The same mournful cello melody, now unhurried and warm, over soft low strings and a single deep drum that fades to nothing; harp and high strings open out at the end like weight lifting. Mood: an enormous suffering creature finally set free. Not a loop: it ends open and calm, no fade-out and no triumphant chord. Instrumental only — no vocals, no choir, no spoken words.
```

### 8. Across the Storm — ship-crossing minigame

*Action loop · D dorian · 136 BPM · 2:30*

```text
Instrumental fantasy sailing action music for a small repaired boat crossing dangerous water toward a distant island, dodging wreckage and fighting off attackers, 136 BPM, D dorian, urgent, propulsive and exciting. Fast rhythmic strings drive the forward pulse, frame drums and low toms push hard underneath, a low fiddle takes a bold running melody, brief bright horn phrases cut in and out, and sharp high string accents flick across the top like spray and sudden turns. Rising and falling waves of intensity, but the pulse never stops and never pauses. Mood: risky momentum and a crew working together — thrilling, not hopeless, and not the final battle of the game. Structure: straight into the drive from the first bar, a lighter passage with drums and fiddle alone in the middle, then the fullest and fastest-feeling statement to finish. Seamless loop for a game action sequence: strict steady tempo, no rubato, ends mid-energy on the main rhythm, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `long breakdown, ambient section, sea shanty, comedic, triumphant ending, slow intro`

**Arrival cue** (separate 0:30 generation):

```text
Instrumental fantasy cinematic arrival, 100 BPM, D dorian opening into D major, relief and landfall. The sailing rhythm slows and settles, low fiddle and wooden flute take a warm open phrase over sustained strings, drums soften to a last low roll. Mood: a dangerous crossing survived, solid ground ahead. Not a loop: it ends settled and calm, no fade-out. Instrumental only — no vocals, no choir, no spoken words.
```

---

## 5. Hub and rifts

### 9. A Place to Return — Waystation hub

*Hub loop · D major · 68 BPM · 4:00*

```text
Instrumental fantasy refuge music for a safe waystation where tired people mend armour, tend animals and share news, 68 BPM, D major, warm, restful and quietly sad. Gentle sustained strings, a soft wooden flute melody that comes and goes, fingerpicked acoustic guitar and harp, a warm solo cello underneath, and almost no percussion — at most a soft low pulse. Simple, unhurried phrases with plenty of silence; nothing virtuosic and nothing that draws attention to itself. Mood: shelter after hardship, people who are tired but not defeated, a small shadow of grief under steady growing hope. This plays for long stretches under shop menus and conversation: keep it very open and low in density, melody sparse, no swells, no dramatic accents, no busy counterpoint. Structure: guitar and strings alone, flute melody enters after about a minute, cello joins for a warmer middle, then settles back to guitar and strings. Seamless loop for a game hub: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `tavern, jig, comedic, dramatic swells, impacts, solo showpiece, busy arrangement`

### 10. Lessons Beyond the Rift — Rift Hall

*Hub loop · F♯ minor · 72 BPM · 3:00 — plus a training version at 114 BPM*

```text
Instrumental fantasy music for a quiet hall of violet crystalline portals that preserve old fighting disciplines, 72 BPM, F sharp minor with bright open fifths, mysterious, welcoming and studious. Clear glass-like chimes and crystal bells ring a short memorable figure, gentle strings hold a calm bed beneath, a subtle pulsing synthetic-glass pattern breathes slowly underneath like the portals themselves, and a soft harp marks the corners of phrases. Bright and curious rather than ominous: this is preserved knowledge and a place of learning, not a prison. Keep it calm and spacious under dialogue: no drums, no dense pads, melody high and sparse. Structure: one chime figure alone, strings arrive underneath, the pulsing pattern and harp fill a steady middle section, then it thins back to the chime figure. Seamless loop for a game hub: strict steady tempo, no rubato, ends in the same texture and harmony it began with, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `ominous, horror, sinister, dark ambient, drone metal, heavy drums, suspense`

**Training version** (separate 3:00 generation):

```text
Instrumental fantasy training-challenge music for trials of skill beyond crystalline portals, 114 BPM, F sharp minor with bright open fifths, focused, energetic and encouraging. The same glass chimes and crystal bells now play a quicker, more insistent figure, fast controlled string ostinato underneath, tight hand drums and light tuned percussion driving a steady clear pulse, harp accents on the turns. Confident and welcoming rather than threatening — a test you are meant to pass. Keep a clear steady groove with space between accents for hit and block sounds. Structure: chimes and drums set the pulse, strings drive a steady middle, one brief lighter passage, then the fullest statement. Seamless loop for a game challenge: strict steady tempo, no rubato, ends mid-energy on the main rhythm, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

---

## 6. The ending suite

Three separate cues, not one track. 11A and 11B are cinematic and do **not** loop cleanly by
design: they hold an open texture so they can run under dialogue of any length. Ask your
engine to cross-fade into the next cue rather than trying to loop these.

### 11A. Beyond the Gate — Void arrival

*Cinematic · C minor · very slow free pulse · 1:30*

```text
Instrumental dark fantasy cinematic ambience for a hero pulled through an overwhelming breach into a vast black void, C minor, no fixed tempo, very slow and floating, shocked and hollow. Opens with one brief collapsing swell of low strings and deep sub bass, then drops almost to silence. After that: deep restrained sustained string tones, distant glass-like bell notes falling at irregular intervals, and slow unstable harmonies that drift a little out of tune with each other, suggesting countless trapped souls and impossible distance. Enormous slow reverb, long gaps, almost nothing happening. Mood: the fight is won but nothing has been saved yet — awe, scale and dread, no triumph whatsoever. Keep it quiet and uncluttered so dialogue sits on top: no rhythm, no repeated impacts, no melody. The last 40 seconds should be a near-static quiet texture that could continue indefinitely. Not a loop: it ends unresolved and quiet, no fade-out and no final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `triumphant, victory theme, heroic, percussion, rhythmic, whispers, drums`

### 11B. Ian's Promise — meeting Ian's spirit

*Cinematic · D major · 64 BPM · 2:00*

```text
Instrumental fantasy cinematic music for a young hero meeting the spirit of the legendary protector who came before them, 64 BPM, D major, intimate, warm and sincere. Begins with a solo cello alone playing a simple unhurried melody, joined by a few soft harp notes, then gentle sustained strings gathering slowly underneath, and a distant wooden flute near the end. Nothing loud, nothing fast, no percussion. Mood: recognition across generations, an unexpected truth, responsibility handed on — hope entering darkness without becoming a victory yet. The middle 45 seconds must be a quiet sustained low-intensity passage with very little movement, so dialogue of any length can play over it. Leave the midrange clear for voices: melody low and slow or high and sparse, never dense. Structure: solo cello, then harp, then strings; a long quiet middle; then the strings open out warmly one last time and settle. Not a loop: it ends warm and open, no fade-out and no big final chord. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `grand finale, epic climax, brass fanfare, drums, sad funeral, mournful`

### 11C. Cut the Binding — final charge

*Pressure loop · D minor rising to D major · 132 BPM · 1:30*

```text
Instrumental fantasy climax music for a hero straining to charge a legendary blade against an immense force while time runs out, 132 BPM, D minor leaning toward D major, desperate, purposeful and building. Starts from a warm solo cello statement, then urgent low string ostinato, rising brass lines and layered percussion enter fast. The sense of acceleration comes from the rhythm getting denser — halved note values, more layers, tighter drum subdivisions — while the tempo itself stays locked. Powerful and heroic effort, never comic or frantic. Leave gaps in the percussion for impacts and effort sounds. Structure: a short entrance, then a sustained high-pressure section that stays at maximum intensity without resolving, so it can repeat for as long as the struggle lasts. Seamless loop for a game sequence: strict steady tempo, no rubato, ends mid-energy on the main rhythm, unresolved, no fade-out, no final chord and no victory before the cut. Instrumental only — no vocals, no choir, no spoken words.
```

**Also exclude:** `victory, triumphant resolution, celebratory, comedic, button mashing, tempo changes`

**Success cue** (separate 0:30 generation, fires on the cut):

```text
Instrumental fantasy cinematic release for a prison of souls finally breaking open, 100 BPM, D minor resolving decisively into bright D major. One huge decisive orchestral strike, then light pouring out: soaring warm strings, harp, high bells and a warm horn line opening upward, percussion falling away to nothing. Mood: overwhelming relief and release after enormous effort, countless souls freed. Not a loop: it ends bright and open, ready to run into a peaceful restoration track, no fade-out. Instrumental only — no vocals, no choir, no spoken words.
```

---

## 7. After generating

Same preparation as the Bladefall score, so the two sets sit at the same level:

1. Trim any digital silence from head and tail, on a bar line where you can.
2. Normalise: **−21 LUFS** for exploration, hub and cinematic cues; **−18 LUFS** for bosses,
   the crossing, the training version and 11C. Keep true peak at or under −1 dBTP.
3. Masters: keep the original download (or a WAV) for the 3D engine — Unity and Unreal both
   prefer an uncompressed source and compress on import. Only make 192 kbps MP3s for the
   Bladefall web build, where download size matters.
4. Check the loop by playing the trimmed file twice back to back before wiring it up.

**Reusable in Bladefall as-is:** "The Fallen" suits any disciplined humanoid mini-boss; "Lessons
Beyond the Rift" would sit well in a refuge or hub; "Beyond the Gate" belongs to anything void-
themed. The rest is warmer and more folk-coloured than Bladefall's fever-chamber palette, so
treat those as a deliberate change of light rather than a drop-in.
