## Fractured Marksman refinement — 7.211.5 / cache v299
Held strokes now identify the attack: I single, II brace, III Reckoning in every phase (formerly
sequence position could show II for a single or IV for Reckoning). Off-screen count/lock cues,
shared projectile/preview origins, exact brace spread, world-scaled figures and brighter coats
improve legibility. The works target has a visible gate cable; the exposed tally board fades
its lit rims over the actual blade window. A returned Reckoning clears the Tallyman volley;
watch arrows remain. Dead actors stop advancing attacks; death clears transient aim/volley state.
A completed save restores the kneeling Tallyman, cut board and laid-down bow.
20 focused tests pass (Marksman, campaign order, player flags). Browser: native mouth placement
and stepping away opened the works gate without damage. A targeted Reckoning-state fixture,
with a freshly placed native mouth, returned the real shot; native dash/jump/blade inputs cut
one tally with no damage or healing. Reload retained that earned tally and the works gate.
Completed-save fixture verified the kneeling figure and open exit. Representative warning,
exposure and victory renders inspected; no browser errors. No full fight/level/co-op claim.
Road geometry, kit, Windcut, attack sequences and timings retained. Local mirror rebuilt;
no commit/push/deployment. Next refinement: Fractured Keep.

# The Fractured Marksman (stage 24) — built 2026-09-24 (7.204.0)

Act Three's fifth echo: Marksman Road after the Echo walked it backwards. Night; the watch is still
up; something at the end of the road is keeping count of you. The kit is the one the road was
entered with: **jump, the Oathblade, the dash, and one linked mouth** (portal key on slate; it pairs
with the fixed orange anchor near you). The Muster applies.

**Code:** `public/bladefall-fractured-marksman.js` + `-art.js` on the Fractured core. Stage 24; zone
`fractured-marksman`; seam `fu-fm` from the Updrafts; rest site `watch-embers`; the east seam opens
only once the Tallyman is done. Music: the original's theme walked backwards
(`fractured-crosshairs-over-open-ground.mp3`) and "The Wayfarer's Hearth" for the court.

## The watch (the region's own archers)
The original's watch snipers are stage-4-only engine code, so the echo has its own: archers on
perches out of reach. One **sees** you when no mantlet (or tower) stands on the line between you;
it **draws** — a dotted sightline follows you — and **locks** for the last 28% of the draw (the line
turns solid, a crosshair); then looses one arrow at the locked point, leading you by the arrow's whole
flight. Keep your pace and it finds you; **break your pace after the lock** (stop, turn, jump, dash)
and it misses. A mantlet stops an arrow; the dash's invulnerability passes one. An arrow sent back
through your mouth kills the archer it reaches (`portalGate:'reflect'`, one bank) and strikes the
hardware it was aimed at. Mantlets are 64 high — one jump — cover to stand behind, never walls.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Shotfall | 0–2400 | Shotfall Camp: broad cover, crystals over mantlets | three pits between four mantlets, one watch at the far tower: cross between its shots. Measured: a steady walk takes 2 hits; breaking pace at each lock, none |
| The Watching Road | 2400–4300 | slate + anchor over the gap | the slick tower (700 high): set the mouth on the slate, walk onto it, out of the anchor on the ledge beyond; the tower watch still covers the slate; a shieldbearer on the road |
| The Mantlet Works | 4300–7000 | a watch shot redirected into the release | **the works gate opens only to its own watch's arrow, sent back**: stand on the slate where it can see you, set the mouth, let it lock, step off — the arrow goes in, out of the anchor level at the target |
| The Windcut | 7000–8900 | height into reach | set the mouth on the floor slate, climb the scaffold (rises of 60) to the perch (480), fall into the mouth, leave the anchor on the far face of the **anchor tower** at ~1120: over the void to the landing. The tower is there because a jump and two dashes off the perch reach as far as the launch (measured 8275–8310) |
| The Tally Court | 8950–10350 | Deadeye Court | **the C-side** |

## The C-side: the Tallyman — a count to learn
The Marksman's echo stands on a perch no jump reaches, with a longbow and a tally board on its back.
Walk in and the west bars drop. It **counts** — it holds up the count in the fingers of its other
hand while it draws:

| Count | Shot | Tell | Answer |
|---|---|---|---|
| I | one arrow, leading you | 0.7 s (locks at 75%) | break your pace after the lock, or dash through it |
| II | three arrows, spread | 0.9 s (locks at 80%) | a mantlet, or the dash |
| III | **the Reckoning**: slow, pale, heavy (2 Blood), **aimed at your feet** | follows you 1.0 s, holds its aim 0.5 s | **stand with your mouth between you and it** (set it on the slate, stand 5–45 west of it): the Reckoning goes in, out of the tally post (an anchor level with its perch) and home |

The Reckoning returned knocks it off its perch; it lies on the floor for 2.6 s — **cut a tally with
the blade** before it climbs back. The held strokes identify the shot type, including repeated counts. Its rhythm tightens as it loses (I-I-III; I-II-III; II-I-II-III;
recovery 0.8 → 0.6 s). Three tallies: it lays the bow on the floor; the east gate lifts. Cut tallies
stay cut through a death (latched); a death puts it back on its perch. Singles or braces that go
through your mouth fly home too — and glance off it: only the Reckoning counts.

Design lineage: Hollow Knight / Dark Souls readable tells, a delayed lock, and a punish window;
the original Marksman's rangefinder bank-shot; the count as the pattern made visible.

## Historical construction verification (not replayed in this pass)
Muster off, the watches and the Tallyman live, one continuous run: the Shotfall (pace-breaking, 0
hits), the road's mouth onto the anchor, the works redirect (gate opens, no damage), the Windcut
(mouth, eight-step climb, launch landing at 8328), down into the court, the Tallyman beaten (three
tallies), the east gate, the end card ("THE FRACTURED CAUSEWAY"). A duel bot wins the court in ~80 s
taking 16 hits (it heals; most hits are singles and braces while it drifts off its stand after
knock-back — a bot's clumsiness, not a hidden rule).

Changed while verifying: mantlets were 150 high and walled the road (now 64: cover you jump); the
first ones stood on pit edges (jumping one landed you in the pit); the watch led you by 0.28 s against
a 2 s flight (walking on dodged everything; now it leads by the flight); a slate outside its anchor's
range when you step off (the engine pairs the mouth only while you are in range — every slate now
sits well inside exactly one); the Windcut needed its tower; the Windcut climb had 120 rises; the
Reckoning first aimed at your middle, which meant standing ON your mouth — and stepping back onto a
mouth takes you through it.

## Open
- Owner playtest: does the count read (the held-up strokes, the pale line) without a sign; the court's
  difficulty with 5 Blood; whether glancing singles through the mouth confuse.
- With the Muster alive (bot, 7.205): the watching road's shieldbearer, passed with a jump-dash, no hits; the works road,
  2 kills for 2 hits in 15.5 s.
