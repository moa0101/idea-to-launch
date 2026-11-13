---
name: launch-build-web
description: >-
  Builder for web apps and SaaS in the launch panel. Builds a functional MVP from
  launch/spec.md with Next.js (App Router, TypeScript), Tailwind + shadcn/ui,
  Supabase (auth + Postgres + row-level security) running locally, optional Stripe
  test mode, then runs it and verifies the acceptance checks in the browser. Use
  from /launch when platform is web, or when the user asks to build/extend the web
  version of a launch project.
argument-hint: "[project root]"
---

# launch-build-web

Read first: `launch/spec.md`, `launch/scope.md`, `launch/brand.md`,
`brand/tokens.json`, `launch/decisions.md`. Follow the panel's laws and hard stops
from the `launch` skill.

## Default stack (log any deviation in decisions.md)

| layer | default | why |
| --- | --- | --- |
| framework | Next.js latest stable, App Router, TypeScript, `src/` | best-documented full-stack React, one-click Vercel deploy later |
| UI | Tailwind CSS + shadcn/ui, lucide-react icons | accessible primitives, fast to theme from tokens |
| backend | Supabase: Auth + Postgres + RLS, `@supabase/ssr` | real auth & DB, generous free tier, runs locally via Docker |
| validation | zod; server actions for mutations | type-safe, few moving parts |
| payments (only if spec says paid) | Stripe Checkout in **test mode** | standard; no real money |
| tests | Playwright for the critical flow, `tsc --noEmit`, `next lint` | proves the flow, not just compiles |

### Backend selection (no question unless a hard stop)

1. Docker running (`docker info` succeeds) → **local Supabase**:
   `npx -y supabase@latest init`, `npx -y supabase@latest start`. Read the local URL
   and anon/service keys from `npx supabase status -o env` into `.env.local`.
   Migrations in `supabase/migrations/`, seed in `supabase/seed.sql`.
2. Docker installed but not running → `open -a Docker`, wait up to ~60s polling
   `docker info` (use Monitor/until loop, no sleep), then (1).
3. No Docker → **SQLite fallback**: Drizzle ORM + better-sqlite3 + Auth.js
   (credentials or email magic-link printed to console in dev). Log it.
4. Hosted Supabase project → only on a deploy request; it's a hard stop (account).

Single-user tools that need no accounts may skip auth entirely and say so in
decisions.md — still persist data in the DB.

## Build order

1. Scaffold: `npx -y create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`
   (into an existing dir: scaffold in a temp subfolder and move, keeping `launch/`,
   `brand/`, `.git`). `npx -y shadcn@latest init -d`, add only components used.
2. Theme: map `brand/tokens.json` → CSS variables in `globals.css` (light + dark
   under `.dark` and `prefers-color-scheme`), fonts via `next/font/google`,
   favicon/OG from `brand/`. App name & slogan in `metadata`.
3. Data: write the migration from the spec's data model. **Every user-owned table
   gets RLS** with `auth.uid() = user_id` policies for select/insert/update/delete.
   Seed realistic demo data + one test user (credentials in `supabase/seed.sql` and
   `.env.example` comments, never in chat).
4. Auth (if needed): email+password with local Supabase (Inbucket at
   http://127.0.0.1:54324 catches emails); middleware refreshing the session;
   protected routes redirect to `/login`.
5. **Critical flow end to end first** → run it → commit.
6. Remaining MUST features, each: build → check → commit.
7. Landing page at `/` for logged-out users: hero with name + slogan + one-line
   pitch + CTA, 3 benefit blocks from the competitor gap, footer. Copy in brand voice.
8. Polish pass: empty states, loading states, error toasts, mobile layout (375px),
   keyboard focus, `<title>` per page. No dead links/buttons — hide what isn't built.

## Run & verify

- `preview_start` reads `.claude/launch.json` from the **session's working directory**
  (usually the ideas folder, not the project). Add an entry there:
  `{"name":"<slug>","runtimeExecutable":"npm","runtimeArgs":["--prefix","<slug>","run","dev"],"port":3000}`
  and start it with `preview_start`. Never start the dev server via Bash.
- Walk every acceptance check in the browser pane (navigate, form_input, click,
  read_page). Use test credentials from the seed only (local dev host).
- Check console errors (`read_console_messages onlyErrors`) and fix them.
- Resize to mobile preset, screenshot main screens into `launch/screens/`, reset to desktop.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` must pass. Add one Playwright
  test of the critical flow (`npx playwright install chromium` is a project dep, fine).

## Deploy (only after the user confirms — hard stop)

Vercel: create project (Vercel MCP or `npx vercel`), hosted Supabase project, push
migrations (`supabase db push`), set env vars on Vercel, deploy, then re-run the
acceptance checks against the deployed URL. Stripe stays in test mode until the user
switches it themselves.

## Output

Working app in the project root, `README.md` run instructions
(`npx supabase start && npm run dev`), screenshots, commits per slice.
