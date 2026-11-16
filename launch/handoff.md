# Hand-off: idea-to-launch v1.2.0 (level v2, 2026-11-15)

- **Level:** Works → Credible (provisional). Details and scorecard: `launch/levels/v2.md`.
- **Branch:** `level/v2`, not merged and not pushed.
- **Checks:**
  - `node scripts/validate.mjs`
  - `claude plugin validate .`
  - in `examples/vanful`: `npm ci && npm test && npm run build`
- **Measure:** `./scripts/stats.sh`. Baseline (2026-11-15): 0 stars, 28 views, 50 clones (14 d).
- **Next for you:** merge and push, check CI is green, then post from `launch/posts.md`.
