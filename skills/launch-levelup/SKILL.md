---
name: launch-levelup
description: >-
  The challenger. Takes a product that /launch already built and the user tested, plus
  the user's "next step is: …", and ships the next version at a clearly more
  professional level. That means a better product, and also better marketing,
  selling and investor presentation. It first red-teams the current version against
  a professional bar and a level ladder (Works → Credible → Sellable → Fundable →
  Scalable), challenges the requested step if a higher-leverage one exists, then
  builds, verifies and rescores, with a before/after scorecard. Use when the user says
  "/levelup", "next step is", "level up", "v2", "make it more professional", "make it
  sell", "get it investor-ready", "polish it for launch", or gives feedback after
  testing a launch project.
argument-hint: "<next step, feedback from testing, or blank to let the challenger pick>"
---

# launch-levelup: the challenger

v1 proved the idea *works*. Your job is to make the next version **professional**:
something a stranger would trust, pay for, share, or fund. A level-up is never just
"add a feature". Each one moves the product and its story up the ladder together.

The user's next step: `$ARGUMENTS`. If blank, take it from the conversation. If there's
still nothing, the challenger picks the step (Stage 2) and says so.

Follow the `launch` skill's three laws and hard stops (ask little, stop only when it
truly matters, functional beats impressive). Sibling skills may carry the plugin prefix
(`idea-to-launch:launch-brand`, etc.). Use whichever form is in your skill list.

## Stage 0: load the state (no questions)

Read from the project: `launch/idea.md`, `spec.md`, `scope.md`, `verdict.md`,
`competitors.md`, `brand.md`, `decisions.md`, `handoff.md`, and `launch/levels/*.md`
if earlier level-ups exist. Run the app, look at it, and read the code's structure.
Work out the current version number N. v1 is the /launch build.

If `launch/` doesn't exist (the product wasn't made with /launch), write a short
`launch/idea.md` and `launch/spec.md` from the code and the conversation first.

Create a branch `level/v<N+1>` and commit there. Never push.

## Stage 1: the challenge (no questions)

Be the tough, fair reviewer an investor, a buyer and a design lead would be.
Read `ladder.md` and `rubric.md` in this skill's folder (`${CLAUDE_SKILL_DIR}/`).

1. **Place it on the ladder.** Decide which level the project fully passes:
   Works / Credible / Sellable / Fundable / Scalable. Use the ladder's exit criteria,
   not vibes.
2. **Score the rubric**, all 5 tracks (Product, Experience, Market, Sell, Pitch), 0–5
   per line, citing evidence: a file, a screenshot you took, a measurement, a
   competitor link. Measure where you can, for example with Lighthouse
   (`npx -y lighthouse <url> --quiet --chrome-flags="--headless" --output=json`),
   bundle size, time-to-first-action, contrast and console errors.
3. **Benchmark** against the best competitor in `launch/competitors.md`: open their
   site, store page or game and note 3 concrete things they do more professionally.
   Use 1–3 WebSearch/browser lookups at most.
4. **Read the user's test feedback** (in `$ARGUMENTS` or the conversation) as evidence.
   Real user feedback outranks your opinion.

Write `launch/levels/v<N+1>-challenge.md`: the level, the scorecard, the top 5 gaps
ranked by *impact on the next level ÷ effort*, and the benchmark notes.

## Stage 2: pick the level-up (one question only if it matters)

The plan = **the user's step + the minimum set of gaps that gets the project to the next
ladder level.** Keep it shippable in one session: 1 headline item, then 3–6 supporting items.

- **Challenge the request honestly.** If the user's step isn't the highest-leverage
  move, say so in one line with the evidence ("v1 has no way to capture an email,
  so a better deck won't help yet: 0 users to show"). Then still deliver their step,
  plus the item that matters more. Only replace their step if doing it would clearly
  harm the product, and then ask (hard stop).
- **Cover the tracks the next level needs.** Credible needs Experience and Market.
  Sellable needs Sell. Fundable needs Pitch. A product-only step still gets the matching
  story work: if you add a feature, update the landing page, changelog and pitch to sell it.
- **Ask at most ONE `AskUserQuestion`** (up to 3 questions, recommended option first)
  only when the answer changes the build. Typical cases: the audience for the next
  level (customers vs. investors), the price point, or a real account/service the
  plan needs (payments, analytics, domain, which are hard stops anyway).

Write `launch/levels/v<N+1>.md`: target level, headline, items, what's deliberately
NOT in this level, and acceptance checks for each item, all concrete and testable.

## Stage 3: build the level (no questions)

Work track by track. Each item → build → check → commit (`levelup v<N+1>: <item>`).

### Product & Experience (the professional bar)
Use the builder skill for the platform (`launch-build-web`, `launch-build-apple`,
`launch-build-game-web`, `launch-build-game-apple`) for stack rules and verification.
The usual professional gaps after v1:
- **First-run experience:** onboarding/empty states that reach the "aha" in under 60 s,
  sample data, an obvious next action.
- **Craft:** consistent spacing/type scale, motion with purpose, loading and error
  states, no dead ends, dark mode, accessibility (contrast AA, focus, labels, Dynamic Type).
- **Trust:** real domain-ready metadata, privacy policy + terms (clearly marked as
  templates to review with a lawyer), contact/support route, about page.
- **Quality:** tests for the critical flow, error monitoring hook, performance budget
  (web: LCP < 2.5 s, Lighthouse ≥ 90 performance/accessibility/SEO).
- **Measurement:** privacy-friendly analytics events for each step of the critical flow
  (provider is a hard stop if it needs an account; otherwise a local events table/log).

### Market (present it better)
- **Positioning v2:** one sharp line, the target buyer, and the competitor gap as proof.
  Update `launch/brand.md` if the voice or claims sharpen, and go through `launch-brand`
  for any visual change so the tokens stay in sync.
- **The front door:** web → a real landing page in the app (hero, proof, 3 benefits from
  the gap, demo GIF/screens, FAQ, CTA, SEO meta + OG image). iOS/macOS → App Store listing
  (`go-to-market/app-store.md`: name, subtitle, keywords, description, 5 screenshot
  captions, privacy answers). Games → store/portal page (itch.io / CrazyGames copy,
  capsule art brief, trailer script).
- **Launch kit** in `go-to-market/`: launch posts for the 2–3 channels where this buyer
  actually is (named communities, Product Hunt / Show HN / subreddit rules checked), a
  press/one-line pitch, and a 30-second demo script. Drafts only. Posting is a hard stop.
- Use the founder skills if they're installed (`founder:landing-page`,
  `founder:go-to-market`, `founder-marketing`) for depth. Otherwise do it inline.

### Sell (make money possible)
- **Pricing:** 2–3 tiers or a single price, anchored on competitor prices in
  `launch/competitors.md` (cite them). `go-to-market/pricing.md` holds the logic and
  the unit economics (price − cost to serve).
- **The offer:** what's included, guarantee/trial, the reason to buy now.
  No fake scarcity.
- **The mechanism:** web → Stripe Checkout in **test mode** wired to a real plan gate.
  iOS → StoreKit 2 with a local `.storekit` config. Games → a supporter tier or ads
  plan doc. Plus email capture (waitlist table) everywhere. Going live with payments
  is a hard stop.
- **Lifecycle:** welcome email and 2 follow-ups as copy (`go-to-market/emails.md`).

### Pitch (present it to investors and partners)
- `pitch/one-pager.md`: problem, customer, solution, why now, the gap, business model,
  traction (real numbers only; if none, say "pre-launch" and give the plan to get them),
  the ask.
- `pitch/deck.md`: 10–12 slides, each with a headline, content, visual and speaker notes.
  If a slide/deck tool or skill is available (e.g. a Slides artifact type, `pptx`,
  `founder:pitch-deck`), build the real deck from this outline.
- `pitch/demo-script.md`: a 2-minute live demo that walks the critical flow.
- `pitch/metrics.md`: the 3–5 numbers that prove the next level, how each is measured
  in the product (tie to the analytics events), and targets.
- Never invent traction, users, revenue, logos or quotes. Projections are labelled as projections.

Only the tracks in the plan get built. A "Sellable" level-up doesn't produce a 12-slide
deck, and a "Fundable" one doesn't redesign the app.

## Stage 4: verify & rescore (no questions)

- Re-run every v1 acceptance check plus every new one, in the real app (browser
  preview, simulator, or built .app). Desktop and 375px for web.
- Re-measure (Lighthouse etc.) and **rescore the same rubric lines**. Every gain needs
  evidence. Nothing may regress. If something did, fix it or report it.
- Run the project's tests, typecheck and build.
- Add an end-to-end test (Playwright, `channel: 'chrome'`, desktop + a phone profile) that
  plays the new critical path with real mouse/keyboard input, and keep it in the project.
  It's repeatable, and it still works when the in-app browser pane is hidden. A hidden pane
  throttles the page to about 1 fps, so canvas games ignore clicks there.
- Read every marketing, sales and pitch document once as a skeptical buyer or
  investor: cut hype, unproven claims and filler.

## Stage 5: hand-off

Append to `launch/levels/v<N+1>.md` and update `README.md` and `launch/handoff.md`:
- **Scorecard before → after** per track, and the ladder level reached.
- What shipped (product, market, sell, pitch), with file paths.
- Checks with ✅/❌ as observed.
- What's waiting on the user: accounts, legal review, posting, real user tests.
- **The next challenge:** the single highest-leverage step toward the next ladder
  level, phrased so the user can reply with it ("next step is: …").

Final chat message: the level reached (e.g. "Works → Credible"), the 3 biggest
improvements, any hard-stop items waiting on them, and the next challenge.
Offer to merge `level/v<N+1>` into the main branch (their call). Never push or deploy without a yes.

## Rules

- Evidence over adjectives. "More professional" must show up as a measurable change in
  the rubric, a benchmarked element, or user feedback addressed.
- Real data only in marketing and pitch: no fabricated testimonials, users, revenue,
  press logos or competitor claims. Public competitor facts are linked.
- Keep the brand coherent: every new surface uses `brand/tokens.json`.
- Legal templates (privacy, terms) are labelled as templates, not legal advice.
- Cost: no paid services without a hard stop. Free tiers and local first, as in /launch.
