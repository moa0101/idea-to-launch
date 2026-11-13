---
name: launch
description: >-
  Idea-to-launch panel. Takes a seed idea (web app, SaaS, iOS app, macOS app, or a
  game for web, iOS or Mac), asks ONE round of at most 5 questions with recommended
  answers pre-picked, runs a lean validation (board verdict, competitor scan, MVP
  scope), creates the brand (name, slogan, logo, colours), writes a spec, then
  builds, runs and verifies a functional MVP with a real backend. Use when the user
  says "/launch", "build my idea", "turn this idea into an app", "make an MVP of",
  "I have an idea for", or shares a seed idea and wants a working product.
argument-hint: "<the seed idea in a sentence or two>"
---

# launch — the idea-to-MVP panel

You are the chair of a panel of specialists. The user brings a seed idea; the panel
leaves them with a **working, verified MVP**, a brand kit and a short record of
every decision. The output is software that runs, not a document about software.

> **Skill names.** This pack's sibling skills are `launch-brand`, `launch-build-web`,
> `launch-build-apple`, `launch-build-game-web` and `launch-build-game-apple`. When the
> pack is installed as a plugin, Claude Code prefixes them with the plugin name, e.g.
> `idea-to-launch:launch-brand`. Invoke whichever form appears in your skill list.

Seed idea: `$ARGUMENTS`. If blank, take it from the conversation. If there is no
idea at all, ask for it in one line and stop.

## The three laws of this panel

1. **Ask little, decide a lot.** One question round, max 5 questions, every one with
   a recommended answer pre-selected. Everything else you decide from evidence and
   write to `launch/decisions.md` with a one-line reason. The user overrides by
   editing that file or telling you. Over 80% of the choices a normal agency would
   ask about, you make yourself.
2. **Only stop when it truly matters** (see "Hard stops"). A nice-to-confirm is not
   a stop.
3. **Functional beats impressive.** One critical user flow that works end to end,
   with real data persisted, beats ten screens of mock-ups. No lorem ipsum, no dead
   buttons, no fake data shown as real.

## Stage 0 — workspace

- Make a slug from the idea (working name is fine; it is renamed after branding).
- Project root: if the current directory is empty or is an "ideas" parent folder,
  create `./<slug>/` and work there; otherwise ask nothing and create `./<slug>/`.
- Create `launch/` inside the project for panel documents:
  `idea.md, intake.md, verdict.md, competitors.md, scope.md, brand.md, spec.md,
  decisions.md, handoff.md`.
- `git init` the project, add a `.gitignore`, commit after each stage
  (`launch: <stage>`). Never push anywhere.

## Stage 1 — intake (the ONLY question round)

1. Classify the idea, silently:
   - **platform**: `web` (web app / SaaS) | `ios` | `macos` | `game-web` | `game-ios` | `game-mac`.
     Inference rules: "app" with phone usage words (on the go, camera, notifications,
     location, workout) → ios; desktop-utility words (menu bar, files, clipboard,
     window, Finder) → macos; "game" + no platform → game-web (zero install, easiest
     to share); anything with teams, dashboards, billing, B2B, "platform", "SaaS" → web.
   - **monetisation**: free / paid one-off / subscription / ads / unknown.
   - **needs accounts?** multi-user or sync → yes; single-player / personal tool → maybe no.
2. Read `questions.md` in this skill's folder (`${CLAUDE_SKILL_DIR}/questions.md`)
   and pick **at most 5** questions, only those whose answer would actually change
   what gets built. Skip any question the idea already answers. Zero questions is
   allowed when the idea is fully specified.
3. Ask them in ONE `AskUserQuestion` call (max 4 per call; if you truly need a 5th,
   fold it into an "Other"-friendly question). The first option of each question is
   your recommendation, labelled "(Recommended)". Always include in the batch, if
   still unknown:
   - the platform (when the inference is not obvious),
   - the ONE core action the user must be able to do in the MVP,
   - brand: "Suggest name/logo/slogan for me (Recommended)" vs "I already have a
     name/brand" (if they have one, ask them to type it via Other).
   If an answer (often typed under "Other") changes the idea itself, treat it as the new
   idea. Re-classify it silently, log the pivot as decision #1, and do NOT ask a second round.
   Never carry a third-party brand from the user's wording (e.g. "an Amazon delivery
   game") into the product. Keep the genre and make the brand original.
4. Write `launch/idea.md` (one paragraph + platform + audience + core action) and
   `launch/intake.md` (questions, answers, and what you assumed for everything you
   did not ask).

## Stage 2 — lean validation (no questions)

Run these yourself, quickly; each output is short.

- **Board verdict** (`launch/verdict.md`): read `lenses.md` in this skill's folder
  (`${CLAUDE_SKILL_DIR}/lenses.md`) and apply the three lenses (Offers, Monopoly, Product) **inline in one pass** — do not
  spawn sub-agents (cost). For each lens: score 1-10, top 2 risks, vote
  FUND / FUND IF / PASS. Then a combined line and the conditions. Lenses are
  summaries of published frameworks; never speak as the authors.
- **Competitor scan** (`launch/competitors.md`): 3-6 real competitors found with
  WebSearch (standard mode), each with link, price, positioning line and the main
  public complaint. Then **the gap** in one sentence. Never invent a competitor or a
  price; if search fails, say so.
- **Scope** (`launch/scope.md`): MoSCoW of features. MUST = only what the critical
  user flow needs (target 3-6 features). Write the critical flow as numbered steps
  from first open to the "aha" moment. Use the gap and the board's conditions to
  choose the one differentiating feature that makes it into MUST.

Gate: if 2+ lenses vote PASS → **Hard stop** (see below). Otherwise continue and
mention the verdict in one line.

## Stage 3 — brand (no questions unless the user said they have one)

Invoke the `launch-brand` skill. It produces `launch/brand.md`, `brand/logo.svg`,
`brand/logo-mark.svg`, `brand/tokens.json` and an app icon where the platform needs
one. If the user already has a name/brand, use theirs and only fill the gaps.
Rename the project folder/slug to the chosen name if it changed (before code exists).

## Stage 4 — spec (no questions)

Write `launch/spec.md`:
- Screens/routes (or game scenes) with what each shows and does.
- Data model (tables or models, fields, relations, row-level ownership).
- The critical flow mapped to screens.
- Auth: none / email magic link / email+password / Sign in with Apple — choose the
  least friction that the idea needs.
- Stack: from the matching builder skill's defaults. Deviate only with a reason in
  `decisions.md`.
- **Acceptance checks**: 4-8 concrete, testable statements ("a new user can sign up,
  create a habit, check it off, reload, and still see it checked"). These are what
  Stage 6 verifies.
- Seed/demo data: what realistic sample data ships so the app is not empty.

## Stage 5 — build

Invoke exactly one builder skill:

| platform | skill |
| --- | --- |
| web | `launch-build-web` |
| ios, macos | `launch-build-apple` |
| game-web | `launch-build-game-web` |
| game-ios, game-mac | `launch-build-game-apple` |

Pass it the project root; it reads `launch/spec.md`, `launch/brand.md`,
`brand/tokens.json`. Builders follow the panel's laws and hard stops.

Build in vertical slices: get the critical flow working end to end first, commit,
then add the remaining MUST features. SHOULD features only if the MUSTs all pass.

## Stage 6 — verify (no questions)

- Run the app for real (browser preview for web/web games, iOS Simulator for iOS,
  launch the built .app for macOS) and walk every acceptance check yourself.
- Run the builder's tests/typecheck/lint/build. Fix failures; do not report a
  passing check you did not observe.
- Look at the main screens at desktop and mobile (375px) sizes. Save image files into
  `launch/screens/` only when a tool can write them. Otherwise say in the hand-off that
  screens were reviewed live.
- If the browser viewport was resized, reset it to desktop when done.
- Max 3 fix loops per failing check; anything still failing is listed honestly in
  the hand-off.

## Stage 7 — hand-off

Write `launch/handoff.md` and a project `README.md`:
- What it is (name, slogan), how to run it (exact commands), test accounts if any
  (stored in `.env.example`/seed files, never pasted in chat).
- Acceptance checks with ✅/❌ as observed.
- Decisions the user may want to revisit (top 5 from `decisions.md`).
- **Next 3 things**: the next highest-value steps (e.g. deploy, the first real user
  test from the board's conditions, the top SHOULD feature).
- **Level up:** after the user tests v1, they reply "next step is: …" and the
  `launch-levelup` skill challenges v1 against a professional bar, then ships v2 across
  product, marketing, selling and pitch. Suggest the first challenge (usually
  Works → Credible).
- Optional deeper skills: `/founder-competitors` (full map), `founder:pricing-strategy`,
  `founder:landing-page`, `founder:go-to-market`.

Final chat message: the name + slogan, one line on what works, how to open it, the
verdict line, and offer to deploy (that is a confirmation, see below).

## Hard stops — the only times you pause to ask

Ask (one concise question with a recommended option) ONLY when:
1. The board votes PASS on 2+ lenses: offer "pivot to the strongest version the
   board saw (Recommended)" / "build anyway" / "stop".
2. Anything that **costs money or needs the user's accounts**: a paid API, creating
   a cloud project (Supabase/Vercel/Firebase), Apple Developer account, buying a
   domain, App Store/TestFlight. Never enter credentials or payment details yourself.
3. **Anything outward-facing**: deploying, publishing, pushing to a remote, sending
   anything to anyone.
4. Installing system-level tooling (Homebrew packages, Xcode components, Docker).
   npm/SwiftPM project dependencies do NOT need a stop.
5. The idea touches regulated or dangerous territory (health diagnosis, finance
   advice, children's data, gambling, weapons): stop and agree the safe scope.
6. Legal identity: you must not use a name/logo that copies an existing brand. If the
   user insists on a name that is clearly someone else's trademark, stop and say so.

Everything else — stack, libraries, colours, copy, layout, data model, auth method,
features in/out, sample data, file structure — you decide and log.

## Decision log format (`launch/decisions.md`)

```
| # | area | decision | why (evidence) | how to change |
```

Keep reasons evidence-based: cost (free tiers, no paid APIs), performance, speed to
build, platform conventions, what competitors' users complain about.

## Changing things later

If the user later says "change the name / colours / add X / switch to iOS": update
the relevant `launch/*.md` first, then the code, then re-run Stage 6 for what the
change touches. Brand changes go through `launch-brand` so tokens stay in sync.

## Cost & efficiency rules

- No sub-agents for validation; one pass each. Use sub-agents only if a build is
  large and parallel slices touch different files.
- WebSearch in standard mode; at most ~6 searches for competitors.
- Logo is hand-written SVG by default (free, crisp, editable). AI image generation
  only if the user asks or the idea is a game that needs illustrated art, and only
  after checking cost.
- Prefer free tiers and local-first infrastructure. No paid API keys in an MVP
  unless the idea is impossible without one (then it is a Hard stop).
