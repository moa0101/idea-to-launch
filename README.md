<div align="center">

# idea-to-launch

**Share a seed idea. Answer a few quick questions. Get a working MVP.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757)](https://docs.claude.com/en/docs/claude-code)
[![Version](https://img.shields.io/badge/version-1.0.0-2ea44f.svg)](https://github.com/moa0101/idea-to-launch/releases)
![Builds](https://img.shields.io/badge/builds-Web%20%7C%20SaaS%20%7C%20iOS%20%7C%20macOS%20%7C%20Games-555)

[Install](#install) · [How it works](#how-a-run-works) · [Example](#example) · [Good to know](#good-to-know)

</div>

---

A Claude Code plugin that works like a startup panel. It asks you at most 5 questions,
each with a recommended answer pre-selected, then decides everything else from evidence:
- runs a quick board verdict and competitor scan
- creates the brand: name, slogan, colours and an SVG logo
- writes a spec
- builds the product, runs it and tests it the way a user would

```
/launch a habit tracker for remote teams that posts streaks to Slack
```

| platform | stack it builds | how it verifies |
| --- | --- | --- |
| Web app / SaaS | Next.js, Tailwind + shadcn/ui, Supabase (auth, Postgres, row-level security), Stripe test mode if paid | browser preview + Playwright |
| iOS / macOS app | SwiftUI, SwiftData, XcodeGen | iOS Simulator / built `.app` + XCTest |
| Web game | Vite, TypeScript, Phaser 3 | plays it in the browser |
| iOS / Mac game | SpriteKit in SwiftUI | plays it in the Simulator |

## Install

In Claude Code:

```
/plugin marketplace add moa0101/idea-to-launch
/plugin install idea-to-launch@idea-to-launch
```

Or copy the skills in by hand:

```bash
git clone https://github.com/moa0101/idea-to-launch.git
cp -R idea-to-launch/skills/* ~/.claude/skills/
```

## How a run works

| stage | what happens | asks you? |
| --- | --- | --- |
| 1. Intake | Classifies the platform, then asks **one round of at most 5 questions**, each with a recommended default | once |
| 2. Lean check | Board verdict through three published-framework lenses (Offers, Monopoly, Product), a sourced competitor scan, and a MoSCoW scope cut down to one critical flow | only if the board votes PASS |
| 3. Brand | Name with domain and conflict checks, slogan, voice, WCAG-checked colours, a hand-drawn SVG logo and app icon | no |
| 4. Spec | Screens, data model and 4–8 testable acceptance checks | no |
| 5. Build | The matching builder skill builds the critical flow first, then the rest of the must-have features | no |
| 6. Verify | Runs the app and walks every acceptance check | no |
| 7. Hand-off | README, the checks marked pass/fail, decisions worth revisiting, and the next 3 steps | offers to deploy |

Every assumption goes into `launch/decisions.md` in your project. Edit that file or
tell Claude what to change. Want a different name, logo or colours? Say "rebrand it".

### When it stops to ask

It only stops for decisions that really are yours:
- the board votes PASS
- anything that **costs money or needs your accounts** (cloud projects, Apple Developer, domains)
- anything **public** (deploying, publishing, pushing)
- installing system tools (Homebrew, Docker)
- regulated areas (health, finance, kids' data, gambling)
- names that copy someone else's brand

## Skills in this pack

- `launch`: the orchestrator. Start here.
- `launch-brand`: name, slogan, voice, tokens, logo, icons. Also handles rebrands later.
- `launch-build-web`, `launch-build-apple`, `launch-build-game-web`, `launch-build-game-apple`: one builder per platform.

## Requirements

- **Everything:** Claude Code and git.
- **Web apps and web games:** Node 20+. Docker for local Supabase; without it, the builder falls back to SQLite.
- **iOS and macOS:** Xcode 15+ (with simulators) and Homebrew. The builder asks before running `brew install xcodegen`.

MVPs are built to cost **$0** to run locally. No paid APIs unless the idea can't work without one, and then it asks first.

## Example

[`examples/vanful`](examples/vanful) is a browser delivery-puzzle game made in a single `/launch` run. The seed was a dodge game, and the user pivoted it to "pack boxes into vans and deliver along the fastest route" during intake. The run produced:
- the panel documents (`launch/`): verdict, competitors, scope, brand, spec, decisions, hand-off
- the brand kit (`brand/`)
- a playable, unit-tested Phaser game

```bash
cd examples/vanful && npm install && npm run dev
```

## Good to know

- Board lenses are summaries of published frameworks. They never speak as the authors.
- Name checks are quick public searches, not trademark clearance. Results aren't legal, financial or tax advice.
- Games are original. The builders won't recreate an existing game's name, characters, art or levels.

## Credits

The board lenses (`skills/launch/lenses.md`) come from [Founder skill](https://github.com/Jakeschincariol/founder-skill) by Jake Schincariol (MIT). For a deeper business plan, with a 100-buyer consumer panel, a CFO model and pricing, install that pack too. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

MIT
