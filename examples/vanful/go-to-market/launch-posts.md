# Launch posts (v5) — drafts. You post them; never ask friends to upvote.

Each link carries a `?ref=` tag, so `npm run report` shows which post brought players
(only a short tag is stored, never the referrer URL). Post **one channel per day** so the numbers don't blur,
and be there for the first 2 hours to answer comments: that's when posts live or die.

| order | where | link to use | rules (checked 2026-11-14) |
| --- | --- | --- | --- |
| 1 | r/playmygame | `https://vanful.vercel.app/?ref=r-playmygame` | made for devs sharing their own game; a real description is expected, not just a link |
| 2 | r/WebGames | `https://vanful.vercel.app/?ref=r-webgames` | no website name in the title; own games max once a week (wiki via a mirror — **read the sidebar first**) |
| 3 | Show HN | `https://vanful.vercel.app/?ref=hn` | [rules](https://news.ycombinator.com/showhn.html): title starts "Show HN:", must be playable without sign-up (it is), you must answer comments, no upvote requests |
| 4 | r/puzzlevideogames | `https://vanful.vercel.app/?ref=r-puzzlevideogames` | **rules not readable from here**; the sister sub r/puzzles allows promotion only in a weekly thread. Read the sidebar; if in doubt, message the mods |
| — | itch.io devlog | your itch page | post after upload (draft in `launch-kit.md` §1) |

Attach `assets/gameplay.gif` where images are allowed (Reddit yes, HN no).

---

## r/playmygame
**Title:** [Web] Vanful – a 3-minute packing puzzle where the van door is at the back

> I made a small browser puzzle about loading a delivery van. You drag oddly-shaped parcels in,
> then tap the houses in the order you'll drive. The catch: the door's at the back, so the first
> stop's parcels must go in last, or you lose seconds digging them out. Red roads are jammed, so the
> fastest route changes the best packing.
>
> Free, no sign-up, works on phones. Shifts are 3 minutes, and there's a Daily Load that's the same for everyone.
>
> Play: https://vanful.vercel.app/?ref=r-playmygame
>
> I'd really like to know: did the door rule make sense without reading anything, and where did the first minute drag?

## r/WebGames
**Title:** Vanful — pack the van so the first stop comes out first (3 min, mobile-friendly)

> Drag parcels into a delivery van, then pick the route. The door is at the back, so load order
> matters and jammed roads change the best order. Guided first delivery, then a 3-minute shift.
> No sign-up. I made it, so feedback is welcome.
>
> https://vanful.vercel.app/?ref=r-webgames

## Show HN
**Title:** Show HN: Vanful – a packing-and-routing puzzle in the browser

**URL:** `https://vanful.vercel.app/?ref=hn`

**First comment (post it yourself right after submitting):**
> Hi HN. Vanful is a 3-minute puzzle that joins two small problems: polyomino packing and a
> shortest-route choice. The van's door is at the back, so the order you visit stops decides the
> order you must load, and red (jammed) roads cost 3× time.
>
> Technical bits people might like: every round is generated from a seed (mulberry32), the van grid is
> partitioned into polyominoes so a full pack always exists (from round 3, extra parcels make you choose what to leave), routes are Dijkstra on a 5×6 street
> grid with the best visit order brute-forced, and the Daily Load seeds from the date so everyone
> gets the same parcels. It's Phaser + TypeScript; the HTML front page loads first and the engine
> only on Play, which keeps Lighthouse at 100 on mobile.
>
> No account, no ads. It sends anonymous play events (random device id, no PII) unless your browser
> sends DNT/GPC, and there's an off switch in About. Happy to answer anything.

*(Every technical claim above is in the code: `src/logic/rng.ts`, `shapes.ts`, `round.ts`, `city.ts`, `daily.ts`, `src/main.ts`, `src/config.ts`.)*

## r/puzzlevideogames (only if the sidebar allows self-posts)
**Title:** I made a short packing puzzle where load order has to match your delivery route

> Each round: fit polyomino parcels into a van, then choose the delivery order. The door is at the
> back, so the first stop has to be loaded last, and jammed roads change which order is fastest.
> 3-minute shifts plus a daily puzzle that's the same for everyone. Free in the browser, no sign-up.
>
> https://vanful.vercel.app/?ref=r-puzzlevideogames

---

## After posting: read the numbers
```
npm run report -- --since <first post date>
```
"Players by source" shows `web · ref=hn`, `itch`, `crazygames`… A channel is worth repeating when it brings
players who finish the tutorial *and* start a second shift (metrics 1 and 3), not just visits.
