# Decisions

| # | area | decision | why (evidence) | how to change |
| --- | --- | --- | --- | --- |
| 1 | concept | Replace dodge game with pack-and-route delivery puzzle | user's intake answer | edit `launch/idea.md`, re-run /launch |
| 2 | branding | Original brand, no Amazon name/marks/colours | trademark safety (hard-stop rule 6) | — |
| 3 | platform | Browser game | seed said "browser"; zero install, shareable | ask to port with `launch-build-game-apple` |
| 4 | engine | Phaser 3 + Vite + TS | builder default: scenes, drag input, tweens, scaling built in | — |
| 5 | differentiator | Door rule: load order must match route order | competitor gap: packing games ignore route; board condition | tune penalty in `src/config.ts` |
| 6 | clock | 150 s shift; drive time = route minutes × 1 s | user chose 2–3 min runs; makes faster routes literally save time | `SHIFT_SECONDS`, `SECONDS_PER_MINUTE` in config |
| 7 | controls | drag + tap-to-rotate + R/right-click | works with touch and mouse; board asked for forgiving touch | config |
| 8 | art | code-drawn shapes in brand palette, no AI images | $0 cost, crisp at any size, consistent | swap textures in Boot scene |
| 9 | audio | WebAudio-synth SFX, no files | no licensing, tiny | `src/sfx.ts` |
| 10 | persistence | localStorage best score + mute | no backend needed for single player | — |
| 11 | name | Vanful, slogan "Pack it tight. Route it right." | no conflicting product found; .io free; see brand.md | edit `brand/tokens.json` + ask for rebrand |
| 12 | palette | teal/coral/cream; stops also lettered | avoids carrier palettes; contrast ≥ 4.5; colour-blind safe | tokens.json |
| 13 | monetisation | none in MVP | test fun first (board Offers lens) | — |
| 14 | distribution | Copy-score button | board Monopoly lens: needs a viral loop | — |
| 15 | clock | Shift raised from 150 → 180 clock-seconds | driving is time-compressed (a 30 min route ≈ 3 s real), so 150 s gave < 2 min of real play | `SHIFT_SECONDS` |
| 16 | tray | Tray parcels shown up to 80% scale | playtest: parcels at 60% were small on desktop | `layoutTray` scales list |
