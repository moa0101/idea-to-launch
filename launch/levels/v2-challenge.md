# v2 challenge: idea-to-launch (the pack itself), 2026-11-15

**Audience for this level:** Claude Code users who find the repo on GitHub, a marketplace or a post.
They decide in about 10 seconds whether to install it.

## Ladder: **Works**, not yet Credible

**Works:** the pack runs end to end. One real run produced Vanful.
- v1 came from `/launch`.
- v2–v5 came from `/launch-levelup`.
- The game is live at https://vanful.vercel.app.
- `claude plugin validate` passes for both `plugin.json` and `marketplace.json`.

**Credible fails on:**
- The README's level-up command doesn't exist: `/levelup` (README.md:82). The skill is `launch-levelup`.
- Version labels disagree: the README badge says 1.0.0, `plugin.json` says 1.1.0, and the last GitHub release is v1.0.0.
- There's no visual proof (GIF or screenshot) in the README, and no link to the live result.
- The example is a v1 snapshot, so the level-up claims in the README have nothing behind them in the repo.
- There are no automated checks: no CI, no test of the skill files, no link check.
- There's no changelog, no troubleshooting section and no updating section.
- There's no measurement: GitHub shows 0 stars and nobody looks at the traffic data.

## Scorecard (0–5, evidence)

| track | line | score | evidence |
| --- | --- | --- | --- |
| Product | Core flow | 3 | Vanful run: v1 → v5 shipped and live; `/launch` and `/launch-levelup` both completed |
| Product | Depth | 3 | 7 skills, 4 builders; the ladder and rubric are its differentiators |
| Product | Quality | 1 | no tests, no CI; a broken command in the docs; installed and repo copies of the Apple builders drifted (the repo is newer) |
| Product | Performance | 3 | 58 KB of skill text across 10 files; descriptions are 458–908 chars (all under the limit) |
| Product | Measurement | 0 | no stars, traffic or clone tracking |
| Experience | First run | 2 | install is 2 commands, but the first "aha" is a full build (minutes) and the README shows no output to expect |
| Experience | Visual craft | 2 | a tidy README with badges, but text only |
| Experience | States | 2 | the hard stops are documented; nothing on what to do when a run fails (no troubleshooting) |
| Experience | Accessibility | n/a | |
| Experience | Copy | 3 | clear, plain; one wrong command; plugin vs. bare skill names unexplained |
| Experience | Mobile | n/a | |
| Market | Positioning | 2 | "startup panel → working MVP" is clear, but there's no line on the gap vs. superpowers and Bolt |
| Market | Front door | 2 | README only; no demo, no live proof |
| Market | SEO / ASO | 3 | 13 GitHub topics, a repo description; the marketplace description is out of date (no level-up) |
| Market | Launch kit | 0 | none for the pack |
| Market | Trust signals | 3 | MIT, third-party notices, a "When it stops to ask" section; no changelog or security note |
| Sell / Pitch | all | n/a | free, open source; not this level's audience |

## Benchmark: [obra/superpowers](https://github.com/obra/superpowers) (≈318k stars, the top Claude Code skills plugin)

1. **Tests and CI ship with the skills:** a `tests/` folder, `.github/` workflows and a pre-commit config. The skills are treated as code.
2. **Release discipline:** `RELEASE-NOTES.md`, a version-bump config, and a listing in Anthropic's official marketplace (`/plugin install superpowers@claude-plugins-official`).
3. **A README that answers what happens next and what to do when it breaks:** sections for "The Basic Workflow", "When Something Goes Wrong" and "Updating".

## Top 5 gaps (impact on Credible ÷ effort)

1. **Front door is wrong and has no proof.** Fix the commands and versions, add the live demo, a GIF and the real v1 → v5 scorecard. (High impact, low effort.)
2. **Example stops at v1.** Ship the real Vanful v5 example with its level docs, so the ladder claim has evidence. (High, low.)
3. **No automated checks.** Add a validator (skill frontmatter, links, versions, no local paths or secrets) plus CI. (High, medium.)
4. **No changelog, troubleshooting or updating docs.** (Medium, low.)
5. **No measurement or launch kit.** Add a traffic-stats script plus drafted posts for r/ClaudeAI, Show HN, the awesome-claude-code list and the official marketplace. (Medium, low.)
