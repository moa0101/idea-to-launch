# v3 challenge: Vanful v2 vs. Sellable (2026-11-13)

## Ladder: **Credible (provisional)** → **Sellable** fails on every Sell criterion

| Sellable exit criterion | v2 | evidence |
| --- | --- | --- |
| Clear price anchored to competitors | ❌ | no price, no model |
| Purchase path (test mode) or defined ad/supporter model | ❌ | none |
| Email capture | ❌ | no way to reach a player again |
| Onboarding → upgrade path | ❌ | game over is a dead end commercially (Play again / Copy score only) |
| Lifecycle emails written | ❌ | none |
| Unit economics positive | ⚠️ | cost to serve is ~$0 (static hosting) but there's no revenue line |
| Launch kit for 2–3 named channels | ✅ | `go-to-market/launch-kit.md` (v2) |

**The deeper problem: there's no reason to come back.** A 3-minute game with random rounds
and a local best score gives a player nothing tomorrow. Portals pay per play, and supporters pay
for games they return to, so retention comes before any price.

## Price anchors (public, linked)

| game | model | price | source |
| --- | --- | --- | --- |
| Parcel Master (delivery route puzzle, 100 levels) | paid, Steam | ~$3.99 | [IsThereAnyDeal](https://isthereanydeal.com/game/parcel-master/info/), [GG.deals](https://gg.deals/gb/game/parcel-master/) |
| Parcel Dash (van delivery time-trial, leaderboards) | paid, Steam | ~$6.29–$6.99 | [DekuDeals](https://www.dekudeals.com/items/parcel-dash) |
| Package Panic, Postominoes, Speed Packing (packing jam games) | free, itch.io | $0 | `launch/competitors.md` |

Snapshots from third-party trackers; check the live Steam price before quoting it publicly.

## Top gaps (impact on Sellable ÷ effort)

1. **A daily load**: the same seeded shift for everyone each day, a streak, and a spoiler-free share
   card. Gives a reason to return and share. *High / medium.*
2. **Email capture**: "Get new modes by email" with consent, stored in a dedicated table. *High / low.*
3. **A supporter tier**: free game plus a pay-what-you-want supporter pack (cosmetic vans) on itch.io,
   priced below the $3.99 paid anchor. *Medium / medium.*
4. **Pricing and unit economics doc**: model, tiers, honest formulas, no invented ad rates. *Medium / low.*
5. **Lifecycle emails**: welcome, daily reminder (opt-in), new-mode announcement. *Low / low.*
