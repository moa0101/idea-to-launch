# Hand-off — Vanful

**Vanful — Pack it tight. Route it right.** A free browser delivery puzzle: pack the van,
route the town, beat the shift clock. Built with Vite + TypeScript + Phaser 3. No backend, $0 to run.

Run: `npm install && npm run dev` → http://localhost:5173

## Acceptance checks (observed in the browser, 2026-11-13)

| # | check | result |
| --- | --- | --- |
| 1 | Title with name, slogan, Play; no console errors | ✅ |
| 2 | Play → round 1, 6×4 van, lettered/coloured parcels, clock counting down | ✅ (shift is 3:00 after tuning, see decision 15) |
| 3 | Drag to van snaps; rotate on tap; overlap rejected back to tray | ✅ |
| 4 | Map: tap order, shortest path drawn, minutes shown, traffic avoided | ✅ (route 30 min vs best 22 shown in result) |
| 5 | Drive: unloads per stop, score rises, door block shows −3 s and costs clock | ✅ (B behind C → "Door blocks: 1 (−3s)") |
| 6 | Round 2 harder (7×4, 4 stops, 13 parcels); clock 0 → Game over with score & best | ✅ |
| 7 | Reload keeps best score | ✅ ("Best shift: 70") · Play again button uses the same restart path as Play but was not clicked in the test |
| 8 | Works at 375 px (mobile emulation) with mouse drags; `tsc` + build + 7 unit tests pass | ✅ · real-device touch not tested |

Screenshots were reviewed live in the browser pane during the test; no image files were saved to `launch/screens/`.

## Decisions you may want to revisit

1. **Concept switched** from the dodge game to pack-and-route (your intake answer).
2. **Shift = 180 clock-seconds**: driving is time-compressed, so real play is about 2–3 min. Tune `SHIFT_SECONDS`.
3. **Door rule penalty 3 s** per blocked parcel. This is the differentiator; raise it if players ignore it.
4. **Name Vanful**: vanful.io was free and .com is taken; run a trademark search before spending money.
5. **No accounts or online leaderboard**: local best only, until people want to compete.

## Next 3 things

1. **Real test (board condition):** 5 people each play one shift. Measure whether they press "Play again" and whether they understand the door rule without being told.
2. **Deploy** the static `dist/` (Vercel or itch.io HTML5) so the Copy-score link has somewhere to point. This needs your OK and your account.
3. **Top SHOULD feature:** add a "Daily load" (the same seed for everyone each day) plus undo. This is the cheapest path to sharing and a reason to return.

Deeper skills: `/founder-competitors` (full competitor map), `founder:go-to-market` (game portals and communities), `founder:landing-page`.

---

# v2 level-up (2026-11-13): Works → Credible (provisional)

See `launch/levels/v2-challenge.md` (the challenge) and `launch/levels/v2.md` (plan, scorecard, result).

- Guided first delivery, undo, keyboard play, About & privacy, local play log (`?stats`).
- HTML front door: Lighthouse **100/100/100/100** on mobile and desktop (was a11y 76, perf unmeasurable).
- `go-to-market/`: positioning, itch.io + CrazyGames page drafts, launch kit, trailer script.
- Tests: 8 unit + 6 Playwright e2e (desktop + Pixel 7), all passing. Run them with `npm test` and `npm run e2e`.

Waiting on you: a contact route, the 5-person playtest, and any deploy or post.

---

# v3 level-up (2026-11-14): Credible → Sellable (provisional)

See `launch/levels/v3-challenge.md` and `launch/levels/v3.md`.

- **Daily Load**: one shared, date-seeded shift a day, one scored run, streak, spoiler-free share card.
- **Garage**: cosmetic paints. Classic is free, Night Shift needs a 3-day streak, Sunset comes with the supporter code.
- **Email capture** to an insert-only `waitlist` table (hidden until configured).
- `go-to-market/pricing.md` (free + $3 supporter pack + portal ads later) and `emails.md`.
- Tests: 13 unit + 12 e2e, all passing. Lighthouse 100×4 unchanged.

**Live: https://vanful.vercel.app** (deployed from `level/v3`). Smoke-test it any time with `npx playwright test -c playwright.live.config.ts`.
Redeploy with `npx vercel deploy --prod`.

Waiting on you: a waitlist database, the itch.io supporter page, and the playtest (send the live link with the invite in `go-to-market/launch-kit.md`).

---

# v4 level-up (2026-11-14): playtest-ready (still Sellable, provisional)

See `launch/levels/v4-challenge.md` and `launch/levels/v4.md`.

- Anonymous, insert-only play events + 3-question feedback + waitlist (`supabase/migrations/0002_playtest.sql`).
- Consent: off under Do-Not-Track / Global Privacy Control; toggle in About.
- `pitch/metrics.md` (5 metrics, targets set in advance) and the owner report (`npm run report`, SQL in `supabase/queries/`).
- Tests: `npm test` (16), `npm run db:test`, `npm run e2e` (12), `npm run e2e:backend` (real Postgres + PostgREST).

**Live since 2026-11-14 with playtest data on** (Supabase project `vanful`, second account). Live smoke test: `npx playwright test -c playwright.live.config.ts` (never writes to the DB).

Waiting on you: the service key in `.env.local` for `npm run report`, then the 5-person playtest.

# v5 level-up (2026-11-14): public launch kit (Sellable, launch-ready)
- Upload-ready zips for itch.io and CrazyGames (`npm run build:portals` → `release/`), tested from a portal sub-folder (`npm run e2e:portal`).
- Every anonymous event now says where the player came from (`itch`, `crazygames`, `web` + `?ref=` tag); `npm run report` shows "Players by source".
- Covers, screenshots, 2 portal preview videos and a GIF from the real game (`go-to-market/assets/`, `npm run assets`).
- `go-to-market/store-pages.md`, `portal-submission.md`, `launch-posts.md` (Show HN, r/WebGames, r/playmygame, r/puzzlevideogames).

Live since 2026-11-14. Waiting on you: itch.io → CrazyGames → posts → Poki. Details in `launch/levels/v5.md`.
