---
name: launch-brand
description: >-
  Brand designer for the launch panel. From launch/idea.md, launch/competitors.md
  and launch/scope.md, picks a business/app name (with domain and confusion checks),
  a slogan, voice, colour tokens, fonts, and draws a logo and app icon as SVG, then
  exports PNG icons where the platform needs them. Respects any name or brand the
  user already has. Use from /launch, or when the user says "rename it", "new logo",
  "change the colours", "rebrand", or "different slogan" on a launch project.
argument-hint: "[name or brand constraints, if any]"
---

# launch-brand

Make a brand that fits the positioning, costs nothing, and drops straight into code.
No questions unless the user has explicitly asked to choose between options.

## Inputs

`launch/idea.md`, `launch/competitors.md` (names and looks to avoid), `launch/scope.md`,
`launch/intake.md` (any name/brand the user supplied), and `$ARGUMENTS`.
If the user supplied a name/logo/colours, keep them exactly and only fill gaps.

## Step 1 — name

1. Generate 10 candidates across styles: descriptive, evocative, invented, compound,
   metaphor. Rules: ≤ 2 syllable-groups ideal, easy to spell after hearing it, works
   as an app icon label (≤ 12 chars), no generic dictionary word alone.
2. Drop any close to a competitor in `launch/competitors.md` or an obvious famous
   brand.
3. For the top 5, check quickly (WebSearch, standard): is there an existing product
   with that exact name in the same category? Check `<name>.com` / `get<name>.com` /
   `<name>.app` availability with `whois <domain>` via Bash (look for "No match" /
   "NOT FOUND"); if whois is unavailable, mark "unchecked".
4. Pick the winner by: clarity > memorability > domain/handle availability > no
   conflicts. Record the top 3 with their checks in `launch/brand.md`.
5. Always say plainly in brand.md: these are quick public checks, not a trademark
   clearance; a trademark search (USPTO/CIPO/EUIPO/UKIPO, same class) is the user's
   step before spending money on the name. Not legal advice.

## Step 2 — words

- **Slogan**: 3 options, ≤ 7 words each, promising the outcome of the core action;
  pick one.
- **One-line pitch** (≤ 20 words) for app stores / hero section.
- **Voice**: 3 adjectives, each with a do/don't. Used for all UI copy in the build.
- **Microcopy starter**: empty-state line, success toast, error message, onboarding
  first line — in the voice.

## Step 3 — visual tokens

Write `brand/tokens.json`:

```json
{
  "name": "", "slogan": "",
  "color": { "primary": "#", "primaryFg": "#", "accent": "#", "bg": "#", "fg": "#",
             "muted": "#", "border": "#", "danger": "#", "success": "#",
             "dark": { "bg": "#", "fg": "#", "muted": "#", "border": "#" } },
  "font": { "display": "", "text": "", "source": "Google Fonts | system" },
  "radius": "12px",
  "style": "one-line description of the look"
}
```

Rules: derive the palette from the positioning (not a random pick), avoid the
dominant competitor's colour, check text/bg contrast ≥ 4.5:1 (WCAG AA) for fg/bg and
primaryFg/primary — compute it, don't guess. Fonts: free Google Fonts for web; on
Apple platforms default to the system font (SF) with `.rounded`/`.serif` design if
it fits, so no licensing issue.

## Step 4 — logo (hand-written SVG)

- `brand/logo-mark.svg`: a simple geometric symbol, readable at 32px, max 3 colours,
  `viewBox="0 0 512 512"`, no text, no external refs, no fonts.
- `brand/logo.svg`: mark + wordmark. Convert the wordmark to paths only if you can do
  so reliably; otherwise use `font-family` with a system-safe fallback stack.
- `brand/icon.svg`: app icon — the mark on a full-bleed rounded background
  (Apple masks corners itself, so for iOS/macOS use a square full-bleed background).
- Make it meaningful: tie the shape to the core action (a check, a spark, a path…).
  Avoid clichés (lightbulb, rocket, globe) unless the idea truly is about them.
- Optionally (only if the user asks, or for games needing illustrated art) generate
  concepts with an available image tool after checking its cost; label them concepts.

## Step 5 — exports

- Web: copy `brand/logo-mark.svg` → `public/favicon.svg`; build a 512px PNG for
  `apple-touch-icon` and OG image if the builder needs it.
- iOS/macOS: 1024×1024 PNG `brand/icon-1024.png` (no transparency for iOS).
- Render SVG → PNG with whichever works, in this order:
  1. `rsvg-convert -w 1024 -h 1024 in.svg -o out.png` (if installed)
  2. a throwaway Node script in the scratchpad: `npm i sharp` there, then
     `sharp(svg).resize(1024,1024).flatten({background: bg}).png().toFile(out)`
  3. `qlmanage -t -s 1024 -o <dir> in.svg` (fallback; check result visually)
- Look at the PNG (Read tool) to confirm it rendered correctly.

## Output

`launch/brand.md` (name + checks, slogan, pitch, voice, microcopy, palette with
contrast ratios, fonts, logo rationale, "how to change"), `brand/tokens.json`,
`brand/logo.svg`, `brand/logo-mark.svg`, `brand/icon.svg`, PNG exports.
Log the name/palette choice in `launch/decisions.md`.

## Rebrands later

When the user changes name/colours/logo: update `brand/tokens.json` and assets, then
propagate to code (Tailwind/CSS vars, Swift `Theme`/asset catalog, `<title>`, app
display name, README) and grep the project for the old name so nothing is left.
