# v5 challenge: can a stranger find, trust and play Vanful on a portal? (2026-11-14)

**Ladder:** Sellable (provisional). Not Fundable: the live report shows 1 device (the owner). The friends playtest was skipped,
so public traffic is now the only evidence source, and that traffic has to be countable per channel.

## What breaks a public launch today (found, not guessed)

| # | gap | evidence | impact ÷ effort |
| --- | --- | --- | --- |
| 1 | **The build can't run on itch.io or CrazyGames.** Vite builds with absolute paths (`/assets/…`, `/favicon.svg`). | No `vite.config`, so `base` defaults to `/`. [itch.io HTML5 docs](https://itch.io/docs/creators/html5): "Absolute paths … will fail." | blocker · small |
| 2 | **The store copy says something false.** `go-to-market/store-pages.md` says "nothing leaves your device", but v4 sends anonymous play data. | `src/telemetry.ts`, `store-pages.md` | trust · tiny |
| 3 | **Traffic can't be told apart.** Every event looks the same whether it came from itch, CrazyGames, Reddit or HN, so a launch can't show which channel works. | `play_events.props` has no channel; `npm run report` has no breakdown | evidence · small |
| 4 | **No launch assets.** CrazyGames needs 3 covers (1920×1080, 800×1200, 800×800) and 2 silent 15–20 s videos (16:9 and 2:3, first frame = cover). itch needs a 630×500 cover + screenshots. Reddit needs a GIF. None exist; `og.png` is a stop-gap. | [CrazyGames covers](https://docs.crazygames.com/requirements/game-covers/) | required · medium |
| 5 | **Portal fit.** The game shares the page URL (on a portal that is an iframe CDN address) and shows an email form. CrazyGames Basic Launch: no external login, personal data needs a privacy notice. | `GameOver.ts:47`, `:74`; [CrazyGames requirements](https://docs.crazygames.com/requirements/intro/) | quality · small |

## Rules checked for the posts
- **Show HN** ([rules](https://news.ycombinator.com/showhn.html)): title starts "Show HN:", must be playable without sign-up (it is), you must be around to answer comments, never ask friends to upvote.
- **r/WebGames** (wiki, via a mirror, so re-check the sidebar): no website name in the title; your own games at most once a week.
- **r/puzzlevideogames**: rules couldn't be read from here. Check the sidebar before posting; the sister sub r/puzzles allows promotion only in a weekly thread.
- **r/playmygame**: built for developers posting their own games; the post needs a description, not just a link.

## Scorecard (v4 → start of v5)
Product 5 · Experience 5 · Market 4 (trust signals 4, **portal readiness 1**) · Sell 3 · Pitch 1. Market is the track this level moves.
