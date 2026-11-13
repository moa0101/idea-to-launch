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
