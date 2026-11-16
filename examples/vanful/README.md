# Vanful — Pack it tight. Route it right.

> **idea-to-launch example.** v1 was built by one `/launch` run; v2–v5 by `/launch-levelup`. Play it at
> https://vanful.vercel.app. How each version was challenged, planned and scored: [`launch/levels/`](launch/levels).
> Left out of this copy: the internal test screenshots (`launch/screens/`) and the per-store briefs, which held the
> author's local file paths. The game runs without a backend; the Supabase parts switch on only when you add your
> own keys (see `supabase/`).

A 2–3 minute browser delivery puzzle. Pack odd-shaped parcels into your van, plan the
fastest route across town, and deliver before the shift clock runs out. The van door
is at the back: load the first stop by the door, or lose time digging parcels out.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # logic unit tests (packing, door rule, routing, rounds)
npm run e2e        # Playwright (desktop + mobile, your Chrome): tutorial, Daily Load, Garage, email capture
npm run db:test    # database permissions on a throwaway Postgres (Docker)
npm run e2e:backend # real Postgres + PostgREST: events and feedback end to end, then the owner report
npm run build      # typecheck + static build into dist/
npm run build:portals # upload-ready zips for itch.io and CrazyGames → release/
npm run e2e:portal # plays both zips from a portal-style sub-folder
npm run assets     # covers, screenshots, preview videos and GIF from the real game → go-to-market/assets/
```

## Launch
Portal pages, submission steps and rule-checked posts: `go-to-market/store-pages.md`, `portal-submission.md`, `launch-posts.md`.
`npm run report` shows players by source (portal, or the `?ref=` tag on our post links).

## How to play

First visit: press **Play free** on the front page and the guided first delivery teaches the rest.

1. Drag parcels into the van. Tap a parcel (or press **Q/E/R** / right-click while dragging) to rotate. **Z** or Undo takes the last one back.
2. **Plan route ➜**, then tap the houses in visit order. Red roads are jammed (3× slower).
3. **Drive ➜**. A parcel blocked from the door by a later stop costs 3 s.
4. Bonuses: every parcel packed (+100), fastest possible route (+50).

## Daily Load, Garage, supporters

- **Daily Load**: one date-seeded shift per UTC day, the same for everyone, one scored run, a streak and a share card.
- **Garage**: cosmetic paints. Night Shift unlocks at a 3-day streak, Sunset with the supporter code
  (`go-to-market/SUPPORTER_CODE.local.txt`, git-ignored; it's an honour system for a cosmetic reward).
- **Playtest data, feedback and email capture** (optional backend): apply `supabase/migrations/*.sql` to a dedicated
  Supabase project, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). The browser key can only
  insert. Results: `npm run report` (service key in `.env.local`, never deployed). Without the vars, nothing is sent.

## Tune it

Every balance number is in `src/config.ts` (shift length, traffic, penalties, bonuses).
Brand colours and fonts are in `brand/tokens.json`.

## Project

- `src/logic/`: pure game rules, unit-tested
- `src/scenes/`: Phaser scenes (Boot, Title, Game, GameOver)
- `brand/`: logo, icon, tokens
- `launch/`: idea, board verdict, competitors, scope, brand, spec, decisions, hand-off, `levels/` (level-ups)
- `go-to-market/`: positioning, store page drafts, launch kit
- `e2e/`: Playwright end-to-end tests

Privacy: no account, no ads; best score, settings and an event-count log stay in the browser (`?stats` to view).
