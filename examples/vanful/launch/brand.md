# Brand — Vanful

**Slogan:** Pack it tight. Route it right.
**Pitch (≤20 words):** A 2-minute delivery puzzle: pack odd parcels into your van, load the last stop first, and race the clock.

## Name

| candidate | idea | checks (2026-11-13, quick public checks) | verdict |
| --- | --- | --- | --- |
| **Vanful** | "a van full" — the satisfying full pack | web search: no game/app with that name; vanful.io free (whois), vanful.com & vanful.app registered | **chosen** |
| Tetrovan | tetromino + van | tetrovan.com free; but "Tetr-" invites confusion with a famous puzzle trademark | rejected (confusion risk) |
| Packroute | descriptive | packroute.com/.app registered | backup |

Avoided: anything near Parcel Master, Package Rush, Parcel Dash, Package Panic (competitors),
and any Amazon/UPS/FedEx/DHL names, colours or marks.
These are quick public checks, **not trademark clearance**: search USPTO/EUIPO/CIPO in
class 9 (downloadable games) and 41 (online games) before spending money on the name.
Not legal advice.

## Voice — cheerful, snappy, fair

| adjective | do | don't |
| --- | --- | --- |
| cheerful | "Nice pack!" | sarcasm when the player fails |
| snappy | 1–4 word UI labels ("Go!", "Load up") | sentences on buttons |
| fair | say why points were lost ("Blocked door −3 s") | hidden penalties |

Microcopy: empty van → "Drag a parcel in." · success → "Delivered!" · penalty → "Blocked door −3s" ·
first line of play → "Load the last stop first." · game over → "Shift over!"

## Look

| token | hex | job | contrast |
| --- | --- | --- | --- |
| primary (teal) | #0F766E | van, primary buttons | white on it 5.47:1 ✅ |
| accent (coral) | #FF7A59 | highlights, parcels | fg on it 5.71:1 ✅ |
| bg (cream) | #FFF8EE | paper background | fg on it 13.9:1 ✅ |
| fg (ink) | #1E2A32 | text | — |
| muted | #5B6B73 | secondary text | on bg 5.25:1 ✅ |
| danger | #C2410C | penalties | white on it 5.18:1 ✅ |

Stop colours (parcel ↔ house): teal, coral, blue, violet, lime, gold — each stop also
shows a **letter** so colour is never the only cue (colour-blind safe).
Fonts: Fredoka (display) + Nunito (text), Google Fonts, OFL, bundled with @fontsource.
Colours deliberately avoid the big carriers' palettes (orange/navy, brown/gold, purple/orange, yellow/red).

## Logo

`brand/logo-mark.svg`: a teal van whose cargo bay is a 2×3 grid of packed parcels —
the game's two halves (pack + drive) in one shape. Reads at 32 px as a teal block with
coral squares. `brand/logo.svg` adds the wordmark; `brand/icon.svg` is the favicon/app icon.

## How to change

Edit `brand/tokens.json` then ask "rebrand Vanful to …"; colours flow into `src/theme.ts`.
