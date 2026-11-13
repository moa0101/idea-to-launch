# The level ladder

A project is at the highest level whose exit criteria it **fully** meets. Each level-up
aims at the next rung. Skipping rungs usually fails: investors ask for traction a
Credible product can't show, and nobody buys what doesn't look trustworthy.

| level | the question it answers | exit criteria (all must pass) |
| --- | --- | --- |
| **1. Works** | Does the core idea work? | The critical flow works end to end with real persistence; acceptance checks pass; it runs from the README. *(This is what /launch delivers.)* |
| **2. Credible** | Would a stranger trust it in 10 seconds? | First-run reaches the "aha" in < 60 s with no help; polished empty, loading and error states; accessibility AA; web Lighthouse ≥ 90 perf/a11y/SEO; a front door (landing page, store listing or portal page) with a sharp positioning line; privacy/terms/contact present; analytics on the critical flow; no dead ends or placeholder copy. |
| **3. Sellable** | Can someone pay, and would they? | A clear price anchored to competitors; a working purchase path in test mode (Stripe/StoreKit) or a defined ad/supporter model; email capture; an onboarding → upgrade path; lifecycle emails written; unit economics positive per customer; a launch kit ready for 2–3 named channels. |
| **4. Fundable** | Would an investor take the meeting? | One-pager and 10–12 slide deck built only on real data; a demo script that runs live; a metrics plan with events instrumented; traction evidence (real users, a waitlist count, pilot or LOI), or an honest pre-traction plan with a dated experiment; a clear ask and use of funds. |
| **5. Scalable** | Can it grow without breaking? | Deployed with monitoring and error alerts; backups; rate limits and auth hardening; CI with tests on the critical flow; performance budgets enforced; support process; roles/admin if B2B; a cost-per-user model at 10× usage. |

## Typical "next step" requests mapped to levels

| user says | usually needs | watch for |
| --- | --- | --- |
| "make it look professional", "polish" | Credible | marketing surfaces are part of looking professional |
| "add payments", "make money", "pricing" | Sellable | Credible gaps first if trust is missing |
| "pitch to investors", "deck", "fundraise" | Fundable | no traction yet → instrument and run one real test first, and say so |
| "add feature X" | the level X serves | update the front door, changelog and pitch to sell X |
| "launch it", "get users" | Credible → Sellable | deploying and posting are hard stops |
| "it's slow / buggy / users got lost" | Credible | fix the reported issue first; it's evidence |
