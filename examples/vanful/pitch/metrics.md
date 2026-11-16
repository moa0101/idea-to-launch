# Playtest metrics (set before seeing any results)

These are the 5 numbers that decide whether Vanful earns a Fundable pitch. They come from
`public.playtest_report()` (`supabase/migrations/0002_playtest.sql`); run `npm run report`.
Targets were written **before** the playtest so they can't be bent to fit the results.
They're judgement calls for a casual puzzle, not industry benchmarks.

| # | metric | exact definition | source | target | why it matters |
| --- | --- | --- | --- | --- | --- |
| 1 | Tutorial completion | devices with `tutorial_done` ÷ devices with `tutorial_start` | play_events | ≥ 80% | The first minute is where casual players leave |
| 2 | Time to first delivery | median seconds `tutorial_start` → `tutorial_done` per device (client time) | play_events | ≤ 60 s | Credible's "aha in under 60 s", now measured on humans |
| 3 | Played again | devices that finished a shift **and** started 2+ shifts ÷ devices that finished a shift | play_events | ≥ 40% | The board's original question: "did they press Play again?" |
| 4 | Daily return | devices with `daily_done` on 2+ different UTC days ÷ devices with any `daily_done` | play_events | ≥ 30% | Retention drives both portal revenue and supporters |
| 5 | Door rule understood | feedback `door_rule = 'yes'` ÷ feedback responses | feedback | ≥ 70% | The differentiator only counts if players get it |

Context numbers (no target): devices, fun average (1–5), "would play tomorrow", waitlist sign-ups, comments.

**Reading rules:** with fewer than 5 devices, treat results as anecdotes. Never quote these
numbers publicly as "traction" until they come from real, unaffiliated players.
