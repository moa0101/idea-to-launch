---
name: launch-build-game-web
description: >-
  Builder for browser games in the launch panel. Builds a playable, original game MVP
  from launch/spec.md with Vite + TypeScript + Phaser (or plain Canvas for very
  simple games), with a title screen, core loop, scoring, game over/restart, local
  high scores, sound, touch + keyboard controls, and verifies it plays in the
  browser. Use from /launch when platform is game-web.
argument-hint: "[project root]"
---

# launch-build-game-web

Read first: `launch/spec.md` (scenes, core loop, controls, win/lose), `launch/brand.md`,
`brand/tokens.json`. Follow the `launch` skill's laws and hard stops.

## Originality rule

Build original games, or games in a genre / with similar mechanics. Never recreate a
specific existing game's name, characters, art, music, levels or look, even renamed.
If the idea is "X but…", keep the mechanic, invent everything else.

## Default stack

| layer | default | why |
| --- | --- | --- |
| tooling | Vite + TypeScript | instant dev server, static build deploys anywhere free |
| engine | Phaser 3 (latest 3.x) | scenes, physics, input, audio, scale manager built in |
| simple games (grid/puzzle/one-screen) | plain Canvas 2D or DOM | smaller, faster to write |
| art | code-drawn shapes/graphics + brand palette; SVG sprites | zero cost, consistent, crisp |
| audio | WebAudio-synthesised SFX (jsfxr-style params in code) | no asset licensing |
| persistence | localStorage (wrapped in try/catch) for high score & settings | no backend needed |
| online leaderboard (only if spec needs it) | Supabase table | hard stop if hosted |

## The MVP game checklist (all MUST)

1. Title scene: name, slogan, Play, high score, mute toggle.
2. Core loop: the one mechanic that's fun in 10 seconds — tune it before adding content.
3. Difficulty ramp (speed/spawn rate/levels) so a run lasts the session length in spec.
4. Score, juice (screen shake, particles, tweened feedback, hit-pause), SFX.
5. Game over → score, best, Restart in one tap/key.
6. Controls: keyboard AND touch/pointer; `Scale.FIT` responsive, works at 375px wide.
7. Pause on tab blur; resume.
8. 60fps target: object pooling for spawned things, no per-frame allocations.

## Build order

1. `npm create vite@latest . -- --template vanilla-ts` (temp dir + move if not
   empty), `npm i phaser`. Scenes: `Boot`, `Title`, `Game`, `GameOver`.
2. Palette/fonts from tokens; favicon and title from brand.
3. Core loop playable → verify → commit. Then ramp, juice, audio, persistence.
4. Put tunables in `src/config.ts` (speeds, spawn rates, gravity) so balance changes
   are one-line edits.

## Run & verify

- `preview_start` reads `.claude/launch.json` from the **session's working directory**, which
  is usually the ideas folder, not the project. Add an entry there:
  `{"name":"<slug>","runtimeExecutable":"npm","runtimeArgs":["--prefix","<slug>","run","dev"],"port":5173}`.
- Canvas screenshots can lag one frame behind. If the state looks unchanged after an
  action, take a second screenshot or read state through `window.__<game>` before calling it a bug.
- Expose the Phaser game on `window.__<slug>` for read-only inspection.
- Put game rules in pure modules (`src/logic/`) with vitest tests. Phaser scenes only render and handle input.
- Play it yourself in the browser pane: start, take real inputs (key presses /
  clicks), reach game over, restart, reload and confirm the high score persists.
  Use `javascript_tool` only to inspect state (e.g., read score), not to fake play.
- No console errors. Mobile preset check. Screenshots of title, gameplay, game over.
- `npm run build` must pass; `tsc --noEmit` clean.

## Deploy (only after confirmation — hard stop)

Static `dist/` → Vercel/Netlify/itch.io (HTML5 upload zip). Give the itch.io steps;
uploading is the user's action.

## Output

Playable game, README (`npm i && npm run dev`), `src/config.ts` tuning notes in
`launch/handoff.md`, screenshots.
