# Submitting Vanful: step by step (you do these; I can't create accounts or submit for you)

*(In the original project there's also one brief per store, written for Claude in Chrome. They're left out of
this example because they contain the author's local file paths.)*

Order matters: **itch.io first** (you get a public page to link to), then **CrazyGames**, then the **posts**
(`launch-posts.md`), then **Poki**. After each step, `npm run report` shows players under that source.

## 1. itch.io (≈ 20 minutes)
1. Sign in at itch.io → **Upload new project**.
2. Fill the fields from `store-pages.md` → itch.io table, top to bottom.
3. Upload `release/vanful-itch-v5.zip` and tick "played in the browser". Set the embed options from the table.
4. **Save as Draft → View page.** Play the tutorial once in the embed and once on your phone. Check that the
   fullscreen button works and that sound plays after the first tap.
5. Set visibility to **Public**. Copy the page URL into `launch-posts.md` (replace `<itch-url>`).
6. Check it counts: `npm run report` should list `itch` under "Players by source" after your test play.

## 2. CrazyGames (≈ 30 minutes, then their review)
1. Create a developer account at [developer.crazygames.com](https://developer.crazygames.com/) → **Submit a game**.
2. Upload `release/vanful-crazygames-v5.zip` and run their **preview / QA tool** first. Look for: the game
   fills the frame sensibly on desktop (it's portrait, so expect side margins), the tutorial completes, and no
   console errors.
3. Fill the metadata from `store-pages.md` → CrazyGames table. Upload the 3 covers and 2 videos.
4. Submit for **Basic Launch**. Their review takes days, not minutes.

## 3. Poki (5 minutes, then wait)
Send the link from [developers.poki.com](https://developers.poki.com/) with one line:
"A 3-minute packing + routing puzzle with a daily mode; portrait, touch-first."

## Rebuilding after a change
`npm run build:portals` (new zips) · `npm run assets` (new screenshots, covers, videos) · `npm run e2e:portal`
(plays both zips from a sub-folder, the way the portals serve them).
