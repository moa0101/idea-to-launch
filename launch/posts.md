# Launch posts for idea-to-launch: drafts only, posting is yours

**Order:** Show HN → r/ClaudeAI (a few days later) → awesome-claude-code (not before **2026-11-27**).
Push v1.2.0 and make sure CI is green before the first post: people will click the badge.

Measure with `./scripts/stats.sh` before and 3 days after each post. **Baseline (2026-11-15):** 0 stars, 28 views
from 3 unique visitors, and 50 clones from 32 unique cloners in the last 14 days.

---

## 1. Show HN

Rules ([Show HN guidelines](https://news.ycombinator.com/showhn.html)): the title starts with "Show HN:", people
must be able to try it, no sign-up wall, and never ask for upvotes. Post the repo, then add the first comment
yourself.

**Title:** Show HN: idea-to-launch – a Claude Code plugin that turns a one-line idea into a tested MVP

**URL:** https://github.com/moa0101/idea-to-launch

**First comment:**
> I wanted an agent that doesn't just write code from an idea, but does the boring parts a small team would do
> first: a quick verdict on the idea, a competitor scan, a name and logo, a spec with testable checks. Then it
> builds one critical flow and actually runs and verifies it.
>
> idea-to-launch is that, as a Claude Code plugin. `/launch <idea>` asks at most 5 questions (each with a default
> already picked) and decides the rest itself, logging every assumption in `launch/decisions.md`. It builds web
> apps (Next.js + Supabase), iOS/macOS apps (SwiftUI), and web or Apple games.
>
> The second skill, `/launch-levelup`, is a "challenger": it scores the current version on a rubric, compares it
> with the best competitor, pushes back if your next step isn't the most useful one, then ships the next version
> and rescores it.
>
> The example in the repo is a real run: a browser puzzle game, Vanful (https://vanful.vercel.app). v1 came from
> /launch, and v2–v5 from four level-ups. Each version's challenge, plan and scorecard is in
> examples/vanful/launch/levels. It's pre-launch, so there are no player numbers yet.
>
> It stops and asks before anything that costs money, needs your accounts, or is public (deploys, pushes,
> posts). MIT. I'd love to hear where it falls over.

---

## 2. r/ClaudeAI

Before posting, read the subreddit's sidebar and pinned rules in the Reddit app or site; they couldn't be read
from here. Typically: use the flair for projects/showcase, say it's your own project, and no link-only posts.

**Title:** I built a Claude Code plugin that takes an idea to a tested MVP, then "levels it up" version by version

**Body:**
> Sharing my own open-source plugin, idea-to-launch: https://github.com/moa0101/idea-to-launch
>
> - `/launch <idea>` asks ≤ 5 questions (defaults pre-picked), then runs a mini panel: board verdict, competitor
>   scan, scope, brand (name, colours, SVG logo), spec. Then it builds the MVP and verifies it in a browser or
>   simulator.
> - `/launch-levelup` scores the result on a 5-track rubric (Product, Experience, Market, Sell, Pitch), places it on
>   a ladder (Works → Credible → Sellable → Fundable → Scalable), and builds the next level, including store pages
>   and launch posts.
>
> Real example: [Vanful](https://vanful.vercel.app), a small browser puzzle game. v1 came from one /launch run, and
> v2–v5 from level-ups. Every scorecard is in the repo. No users or revenue yet, and none are claimed.
>
> Install:
> ```
> /plugin marketplace add moa0101/idea-to-launch
> /plugin install idea-to-launch@idea-to-launch
> ```
> Feedback welcome, especially runs that went wrong.

---

## 3. awesome-claude-code ([hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code))

Rules ([CONTRIBUTING.md](https://github.com/hesreallyhim/awesome-claude-code/blob/main/CONTRIBUTING.md), read
2026-11-15):
- The project must be at least **14 days old** with commits after the first day, **or** have 100+ stars. The first
  commit was 2026-11-13, so the earliest date is **2026-11-27**.
- **Only through the web issue form** (not a PR), and one resource at a time.
- The maintainer says users should come first. Submit after the posts above, not instead of them.

**Form answers:**
- **Name:** idea-to-launch
- **Link:** https://github.com/moa0101/idea-to-launch
- **Category:** the closest one in the form (Skills / Plugins)
- **Description:** A Claude Code plugin that turns a one-line idea into a validated, branded and tested MVP (web,
  SaaS, iOS, macOS, games), then levels each version up with a scored challenge: rubric, competitor benchmark,
  before/after scorecard.

---

## Later: Anthropic's official plugin directory

The top plugins are also listed at claude.com/plugins (for example `superpowers@claude-plugins-official`). Check
that page for how listings are submitted when you get there. It isn't described here, so nothing is assumed.
