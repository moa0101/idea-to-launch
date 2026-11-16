# Pricing & business model (v3)

## The model: free to play, with three revenue lines

| line | what the player gets | price | why |
| --- | --- | --- | --- |
| **Free game** | Unlimited shifts, the Daily Load, streaks, Classic and Night Shift paints | $0 | Every free packing competitor costs $0 (`launch/competitors.md`). Plays and shares are the growth engine. |
| **Supporter pack** (itch.io, pay-what-you-want) | Sunset paint (supporter code), name in the credits, early access to new modes | **suggested $3, minimum $2** | Below the cheapest paid delivery puzzle found, Parcel Master at ~$3.99 ([IsThereAnyDeal](https://isthereanydeal.com/game/parcel-master/info/)), and well below Parcel Dash at ~$6.29–$6.99 ([DekuDeals](https://www.dekudeals.com/items/parcel-dash)). It's a tip with a thank-you, not a paywall. |
| **Portal ads** (CrazyGames, later) | Nothing changes for the player on our own site | revenue share | Only available at CrazyGames' Full Launch, after Basic Launch (≥ 7 days and ≥ 500 plays) plus their SDK and QA ([docs](https://docs.crazygames.com/requirements/intro/)). |

**No paywall on gameplay.** Every scoring feature is free. The supporter pack is cosmetic and
honour-based (one shared code, `go-to-market/SUPPORTER_CODE.local.txt`, git-ignored). That fits
a $3 tip; it's not DRM.

## Unit economics (formulas; numbers labelled)

- **Cost to serve per player ≈ $0.** The game is a static site (~330 KB gzipped). Hosting on the Vercel Hobby
  tier or itch.io costs nothing at playtest scale. *Assumption: check Vercel's current bandwidth
  limits before a traffic spike.* The waitlist table sits on a free Supabase tier.
- **Supporter revenue = players × conversion × average payment × (1 − platform cut).**
  itch.io lets the creator set the platform's share (open revenue sharing). Payment processor fees apply on top.
  *Conversion and average payment are unknown until real players exist. Don't project them yet.*
- **Portal ad revenue = plays × revenue per play.** Unknown until Full Launch data; not projected.

**Contribution per supporter ≈ $3 × (1 − itch share − processor fees) > $0** at a near-zero
cost to serve. Every sale is positive, so the open question is volume, not margin.

## What decides the real price (after the playtest)
1. Do players come back for the Daily Load? (streak ≥ 3 on testers' devices; `?stats` → `daily_done`)
2. Do they share? (`copy_score` with `daily: true`)
3. Do they ask for more modes? (waitlist sign-ups)

If retention is weak, fix the game before pushing the supporter pack.
