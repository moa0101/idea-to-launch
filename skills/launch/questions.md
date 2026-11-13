# Intake question bank

Pick at most 5. Ask only what changes the build. Every question has the
recommended answer FIRST, marked "(Recommended)", chosen from the idea itself.
Never ask what you can infer. Never ask about stack, colours, libraries, or file
structure — those are panel decisions.

## Always-candidates (ask only if unknown)

1. **Platform** — "Where should the first version run?"
   Options tailored to the idea, e.g. Web app (Recommended: zero install, easiest to
   share and iterate) / iPhone app / Mac app.
2. **Core action** — "What's the ONE thing a user must be able to do in v1?"
   Offer 2-3 candidate core actions you derived from the idea; recommended = the one
   closest to the value moment.
3. **Brand** — "Name, logo and slogan?"
   Suggest them for me (Recommended) / I have a name (type it in Other).

## Situational (pick only if relevant)

| when | question | recommended default |
| --- | --- | --- |
| multi-user is ambiguous | "Is it for one person, or do people share/collaborate?" | the simpler one that still delivers the value |
| target user is vague | "Who is the first user?" (2-3 concrete personas) | the persona with the sharpest pain and easiest reach |
| money is part of the idea | "How does it make money at launch?" | Free MVP, add payments after first users (Recommended) / Subscription with Stripe test mode / One-off purchase |
| content/AI-generated | "Does v1 need AI features?" | No AI in v1, rules-based (Recommended: zero API cost) / Yes, using Claude API (needs your key → hard stop) |
| game | "What feel?" | casual one-tap / puzzle / action arcade — recommend from idea |
| game | "Session length?" | 1-3 min runs (Recommended) / longer levels |
| marketplace / two-sided | "Which side do we build first?" | the supply side that creates content others need |
| data from outside | "Where does the data come from?" | user enters it (Recommended) / import CSV / an external API |
| offline use is plausible (mobile) | "Must it work offline?" | Yes, local-first (Recommended for iOS) |

## Never ask

- Tech stack, framework, database, hosting (panel decides).
- Colours, fonts, logo style (brand skill decides; user can override later).
- Exact feature list (scope decides from the core action + competitor gap).
- Budget questions — the MVP is built to cost $0 in infrastructure by default.
