# Vanful — Pack it tight. Route it right.

A 2–3 minute browser delivery puzzle. Pack odd-shaped parcels into your van, plan the
fastest route across town, and deliver before the shift clock runs out. The van door
is at the back: load the first stop by the door, or lose time digging parcels out.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # logic unit tests (packing, door rule, routing, rounds)
npm run build      # typecheck + static build into dist/
```

## How to play

1. Drag parcels into the van. Tap a parcel (or press **R** / right-click while dragging) to rotate.
2. **Plan route ➜**, then tap the houses in visit order. Red roads are jammed (3× slower).
3. **Drive ➜**. A parcel blocked from the door by a later stop costs 3 s.
4. Bonuses: every parcel packed (+100), fastest possible route (+50).

## Tune it

Every balance number is in `src/config.ts` (shift length, traffic, penalties, bonuses).
Brand colours and fonts are in `brand/tokens.json`.

## Project

- `src/logic/`: pure game rules, unit-tested
- `src/scenes/`: Phaser scenes (Boot, Title, Game, GameOver)
- `brand/`: logo, icon, tokens
- `launch/`: idea, board verdict, competitors, scope, brand, spec, decisions, hand-off
