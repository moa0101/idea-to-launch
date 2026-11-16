# v2 challenge: Vanful v1 under review (2026-11-13)

## Ladder placement: **Works** (passes) → **Credible** (fails)

Works ✅: the critical flow plays end to end; 7 of 8 acceptance checks fully pass (see handoff.md).

Credible ❌ fails on these exit criteria:
- **First run < 60 s without help:** not proven. The door rule (the differentiator) is
  explained only by one line of hint text. The board's top Product-lens risk was "two half-games",
  and the planned real test asks whether players get the door rule untold.
- **Lighthouse ≥ 90:** accessibility is **76**. Performance **can't be scored at all**
  ("NO_LCP"): the page is a bare canvas with no HTML content, so search engines and
  screen readers see nothing.
- **Front door:** none (no portal page copy, no OG/social preview).
- **Trust:** no privacy note, about/credits, or contact route.
- **Analytics on the critical flow:** none.

## Measurements (production build, `vite preview`, Lighthouse 12)

| metric | mobile | desktop |
| --- | --- | --- |
| Performance | n/a (NO_LCP) | n/a (NO_LCP) |
| Accessibility | 76 | 76 |
| Best practices | 100 | 100 |
| SEO | 91 | 91 |
| Failing audits | `meta-viewport` (zoom disabled), `robots-txt`, render-blocking, main-thread 0.5, FCP 0.65 | `meta-viewport`, `robots-txt` |
| JS bundle | 1,221 KB (329 KB gzip): Phaser is about 95%, loaded before anything paints | |

## Scorecard (0–5, evidence)

| track | line | v1 | evidence |
| --- | --- | --- | --- |
| Product | Core flow | 3 | Pack → route → drive → result all work (handoff.md checks 1–6) |
| | Depth | 3 | Door rule works and is previewed on the map, but isn't taught |
| | Quality | 3 | 7 logic tests, tsc and build clean; no tests on scene flow |
| | Performance | 2 | 329 KB gz blocks first paint; LCP unmeasurable |
| | Measurement | 0 | no events |
| Experience | First run | 2 | text-only hint; nothing guides the first drag or the door |
| | Visual craft | 3 | consistent tokens and fonts; tape stripe crosses the letters; stray dots on 2×2 parcels |
| | States | 3 | empty/result/game-over designed; no pause or quit |
| | Accessibility | 2 | zoom blocked (Lighthouse 76), no keyboard-only play, motion not reducible; letters + colours ✅ |
| | Copy | 3 | clear, on voice |
| | Mobile | 3 | fits 375 px; parcels touchable; no real-device test |
| Market | Positioning | 2 | slogan only; no buyer line or gap claim anywhere public |
| | Front door | 0 | no store/portal page |
| | SEO/ASO | 1 | title + description only; no OG image, robots.txt or structured data |
| | Launch kit | 0 | none |
| | Trust signals | 0 | no about, privacy or contact |
| Sell | all lines | 0 | out of scope until Credible |
| Pitch | all lines | 0 | out of scope until Sellable |

## Benchmark: Package Panic (https://judehdesign.itch.io/package-panic)

What it does more professionally (from its public page):
1. **A tutorial** that "can take you through how the game works".
2. **Keyboard controls** for the main actions (Q/E rotate, Space sends the truck), not just mouse.
3. **A portal page with a hook**: a one-line punchy opener, then mechanics, controls and changelog,
   plus a download build. It also has **music**.

Where Vanful already leads: routing plus the door rule (Package Panic has neither), touch support, and instant play with no download.

## Top 5 gaps (impact on Credible ÷ effort)

1. **Guided first delivery** that teaches drag, rotate, the door and the route in one scripted round. *High impact, medium effort.*
2. **HTML front shell**: real headline, how-to and noscript in HTML, zoom allowed, Phaser loaded after first paint, OG/social meta, robots.txt. Fixes accessibility, makes performance measurable, SEO. *High, low.*
3. **Front door and launch kit**: itch.io / CrazyGames page copy, sharper positioning, 30 s trailer script, posts for named channels. *High, low.*
4. **Keyboard parity + undo**: Q/E rotate, Space to advance, Z undo; respect reduced motion. *Medium, low.*
5. **Trust + measurement**: About/privacy screen; local, privacy-friendly event log on every critical step. *Medium, low.*
