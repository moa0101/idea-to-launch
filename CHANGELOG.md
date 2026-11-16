# Changelog

## 1.2.0 (2026-11-15)
- **README:** the real Vanful run (live link, GIF, v1 → v5 table), plus troubleshooting and updating sections. Fixed
  the level-up command (it was `/levelup`; the skill is `launch-levelup`) and explained the plugin's namespaced
  commands.
- **Example:** `examples/vanful` is now the v5 game, with the challenge, plan and scorecard for each level-up.
- **`launch`:** resumes an interrupted run from its last finished stage instead of starting over.
- **Checks:** `scripts/validate.mjs` (skill headers, links, versions, commands, local paths, secrets) runs in CI,
  together with the example's tests and build.
- **Measurement:** `scripts/stats.sh` prints stars, views and clones.

## 1.1.0 (2026-11-13)
- Added `launch-levelup`, the challenger: ladder, rubric, benchmark, before → after scorecard.
- `launch-build-game-web`: Playwright e2e in headless Chrome and an HTML front door (lessons from the Vanful v2 run).

## 1.0.0 (2026-11-13)
- First release: `launch` (the panel), `launch-brand`, and builders for web/SaaS, iOS/macOS, web games and
  iOS/Mac games.
