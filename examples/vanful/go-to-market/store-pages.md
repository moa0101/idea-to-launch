# Store / portal pages (v5, 2026-11-14) — drafts; publishing is your action

Assets are in `go-to-market/assets/` (regenerate any time with `npm run assets`). Zips are in `release/`
(rebuild with `npm run build:portals`). Every image and video comes from the real game.

## itch.io

| field | value |
| --- | --- |
| Title | Vanful |
| Developer / author | cowfounder.com (link: https://cowfounder.com) |
| Project URL | `vanful` (→ `<your-name>.itch.io/vanful`) |
| Short description | Pack it tight. Route it right. A 3-minute delivery puzzle. |
| Classification | Games |
| Kind of project | HTML |
| Release status | Released (or "In development" if you'd rather signal it's early) |
| Pricing | No payments (free). Optional: "Donate" is fine, the game itself stays free. |
| Upload | `release/vanful-itch-v5.zip` → tick **"This file will be played in the browser"** |
| Embed options | **Embed in page**, viewport **540 × 960** · tick **Mobile friendly** (orientation: Portrait) · tick **Fullscreen button** · leave "Click to play" on |
| Genre | Puzzle |
| Tags | puzzle, packing, delivery, casual, short, singleplayer, touch-friendly, cute, logic, daily |
| Inputs | Mouse, Keyboard, Touchscreen |
| Average session | A few minutes |
| Languages | English |
| Accessibility | Configurable controls: no · Interactive tutorial: yes · reduced motion respected |
| Cover image | `assets/cover-itch-630x500.png` |
| Screenshots (in order) | `screen-1-title`, `screen-2-shift`, `screen-3-door-rule`, `screen-4-route`, `screen-5-delivered` |
| Gameplay GIF (in the description) | `assets/gameplay.gif` |

**Description**

> **The door's at the back. Load the first stop last.**
>
> Vanful is a short delivery puzzle. Each round you get a van and a pile of oddly-shaped
> parcels for different houses. Pack them in, then tap the houses in the order you'll drive.
> Red roads are jammed. Any parcel stuck behind another stop's parcels costs you time at the door.
>
> - 3-minute shifts. Beat your best.
> - A **Daily Load**: the same parcels for everyone, one scored run a day, with a spoiler-free share.
> - A guided first delivery teaches everything in under a minute.
> - Mouse, touch or keyboard (Q/E rotate · Z undo · Space next).
> - No account, no ads.
>
> **Privacy:** to improve the game, Vanful sends anonymous play data (a random device id and
> game events like "finished the tutorial"). No name, email or location. It's off if your browser
> sends Do-Not-Track or Global Privacy Control, and you can switch it off in **About**.
>
> **Controls:** drag parcels · tap to rotate · tap houses in order · Drive.

*(v5 fix: the v3 draft said "nothing leaves your device". That stopped being true in v4.)*

## CrazyGames (Basic Launch)

Upload `release/vanful-crazygames-v5.zip`. That build hides the email form, and its share text carries no outside link.
Basic Launch facts ([requirements](https://docs.crazygames.com/requirements/intro/)): SDK optional, no external ads,
no outside login, PEGI 12 content. Full Launch (SDK, ads) comes after ≥ 7 days live and ≥ 500 plays.

| field | value |
| --- | --- |
| Name | Vanful |
| Developer name | cowfounder.com (shown as plain text in the game, no link) |
| Category / tags | Puzzle · packing, delivery, logic, casual, daily, mouse, touch |
| Orientation | Portrait (plays letterboxed on desktop; check it in their preview) |
| Description | first two paragraphs of the itch description + the privacy paragraph |
| Controls | Drag parcels into the van. Tap a parcel (or Q/E) to rotate. Tap houses in delivery order, then Drive. Z = undo, Space = next. |
| Covers ([spec](https://docs.crazygames.com/requirements/game-covers/)) | `cover-landscape-1920x1080.png` · `cover-portrait-800x1200.png` · `cover-square-800x800.png` — title is the only text, no borders, no icons |
| Videos | `preview-landscape-1920x1080.mp4` · `preview-portrait-1080x1620.mp4` — 17 s, silent, the cover is the first frame, no cursor |

## Poki
Poki doesn't take open uploads: you send a link through [Poki for Developers](https://developers.poki.com/) and
they decide. Send `https://vanful.vercel.app` and the landscape video. If they accept, their SDK and their QA come
next; ask them about exclusivity before you also go live on CrazyGames.
