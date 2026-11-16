# v4 challenge: Vanful v3 vs. Fundable (2026-11-14)

## Ladder: **Sellable (provisional)** → **Fundable** fails at the first gate: evidence

| Fundable exit criterion | v3 | evidence |
| --- | --- | --- |
| One-pager and deck on real data | ❌ | no deck; more to the point, **0 real players** |
| Demo script | ❌ | none |
| Metrics plan with events instrumented | ⚠️ | 17 events exist but **stay on each player's device** (`?stats`); nobody can see totals |
| Traction or an honest dated experiment | ❌ | the 5-person playtest is planned but would produce only anecdotes: no shared data, no structured feedback |
| Clear ask and use of funds | ❌ | none |

**The challenge:** a deck now would be built on nothing. The cheapest path to Fundable is making the
playtest produce numbers an investor would accept: tutorial completion, time to first delivery,
"played again", Daily return rate and whether players understood the door rule. Those should come
from all players, in one place, with consent.

## Top gaps (impact on Fundable ÷ effort)
1. **Cross-player, anonymous play data** (insert-only, privacy-respecting, opt-out). *High / medium.*
2. **Structured feedback**: 3 questions in-game, tied to the board's open questions. *High / low.*
3. **Owner results report**: the playtest metrics computed in SQL, not by hand. *High / low.*
4. **Email capture live**: the same database. *Medium / low (blocked on the project limit).*
5. **Metrics definition** (`pitch/metrics.md`): what "good" looks like before seeing results. *Medium / low.*
