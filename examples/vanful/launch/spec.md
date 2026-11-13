# Spec — Vanful (game-web)

## Stack
Vite + TypeScript + Phaser 3, fonts via @fontsource, WebAudio-synth SFX, localStorage.
Static build in `dist/`. No backend, no auth (single-player).

## Scenes

| scene | shows | does |
| --- | --- | --- |
| Boot | — | waits for fonts, builds textures |
| Title | logo, slogan, best score, Play, how-to (3 lines), mute | Play → Game |
| Game: **Pack** phase | top bar (shift clock, score, round); van cargo grid (door on the right side); parcel tray with 5–8 polyomino parcels, each coloured + lettered by stop | drag parcels into the grid (snap), rotate (tap a parcel / R / right-click), drag back to tray to remove; **Go** button |
| Game: **Route** phase | city map: grid of streets, depot, 3–5 stop houses (letters/colours), slow traffic roads in red | tap stops to set order (numbers appear); shortest path per leg (Dijkstra, traffic roads ×3 cost) drawn with total minutes; **Drive** button; Reset order |
| Game: **Drive** | van animates along the path; at each stop parcels unload | per stop: delivered pop; door-blocking penalty shown |
| Round result | delivered, left behind, time used, bonus | auto-continue after 1.6 s |
| GameOver | score, best, rounds, Play again, Copy score | restart / clipboard |

## Rules (data model in memory)

- `Parcel { id, cells: [x,y][], stop: 0..n-1, value = cells.length*10 }`
- `Van { cols: 6, rows: 4 }` (round 1), later rounds 7×4 and 7×5.
- `Round { stops: Stop[], parcels: Parcel[], map: Graph }`
- **Shift clock**: 150 s of real time. Pack phase consumes real time; Drive phase
  consumes *simulated* time = route minutes × 1 s/min (so a faster route literally saves clock).
- **Door rule** (differentiator): the door is the right edge of the cargo grid. When
  unloading stop k, each of its parcels needs a clear straight path to the door along
  its rows (no cells of parcels for *later* stops to its right). Each blocked parcel
  costs 3 s clock ("Blocked door −3s"). Parcels for already-served stops are gone.
- Score: delivered value + speed bonus (`max(0, 40 − routeMinutes) × 5`) + perfect pack
  bonus (+100 when all cells are filled or all parcels packed).
- Parcels not packed are "left behind" (no score). Round ends after driving; next round
  harder (more stops, odd shapes, more traffic). When the clock hits 0 at any time → GameOver.
- Best score in localStorage key `vanful.best`, mute in `vanful.muted` (try/catch).

## Critical flow → scenes
Title → Pack → Route → Drive → Result → Pack (round 2) … → GameOver → Play again.

## Acceptance checks

1. Opening the page shows the Title with name, slogan and Play within 2 s; no console errors.
2. Pressing Play starts round 1 with a 6×4 van and lettered, coloured parcels; the clock counts down from 2:30.
3. A parcel can be dragged into the van, snaps to the grid, can be rotated, cannot overlap or go outside; dragging out returns it to the tray.
4. Go → map; tapping stops sets a visit order and draws a shortest path with its total minutes; a route avoiding red traffic roads is shorter in minutes.
5. Drive → parcels unload per stop, score increases; a parcel blocked from the door shows "Blocked door −3s" and the clock drops 3 s extra.
6. Round 2 starts automatically with a harder load; when the clock reaches 0 the GameOver screen shows score and best.
7. Play again restarts; reloading the page keeps the best score.
8. Works with touch at 375 px width (Scale.FIT) and with mouse/keyboard; `npm run build` and `tsc` pass.

## Seed content
Procedural rounds from a seeded RNG (seed changes per shift); a fixed hand-made round 1
that teaches the door rule (3 stops, 6 parcels that fit exactly if loaded correctly).
