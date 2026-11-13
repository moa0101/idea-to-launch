# MVP scope

## Critical flow (open → "aha")

1. Open the link → title screen with Play (no sign-up).
2. Round 1 starts: a van cargo grid and 5–8 parcel shapes, each tagged with a coloured
   house number (stop A/B/C…).
3. Drag a parcel onto the grid; it snaps; tap it (or press R / right-click while dragging) to rotate.
4. Press **Go** → the city map: tap stops to set the delivery order; the shortest road
   path is drawn with its travel time (traffic roads are slower).
5. The van drives; each stop unloads parcels for it — the **door-blocking rule**: a
   parcel whose door-side column is blocked by another stop's parcel costs a time penalty.
6. Round score pops (parcels delivered × value + speed bonus − penalties) → next round
   with a bigger/odd-shaped load.
7. Shift clock (150 s) runs out → game-over: score, best, Play again, Copy score.
   **Aha:** "if I'd loaded stop C at the back, I'd have finished faster."

## MoSCoW

| must (MVP) | should | could | won't (v1) |
| --- | --- | --- | --- |
| Drag/rotate/snap packing on a fixed grid | Vans of different sizes per round | Daily seeded shift | Accounts, online leaderboard |
| City map with selectable stop order + shortest path + traffic roads | Undo last placement | Weather events | Payments / ads |
| **Door-blocking rule (differentiator from the gap)** | Tutorial hints on round 1 | Upgrades between shifts | 3D, physics stacking |
| Shift clock 150 s, rounds escalate | Mute + volume | Music | Multiplayer |
| Score, best (localStorage), game over, restart, copy-score | Combo for perfect pack (100% fill) | Achievements | |
| Mouse + touch, responsive to 375 px, SFX | | | |
