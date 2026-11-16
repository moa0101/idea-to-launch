import { buildCity, City } from './city';
import { Rng, randInt, shuffle } from './rng';
import { Cell, normalize, partition } from './shapes';

export interface Parcel { id: number; shape: Cell[]; stop: number }

export interface RoundDef {
  n: number;
  cols: number;
  rows: number;
  stopCount: number;
  parcels: Parcel[];
  city: City;
}

export const STOP_LETTERS = 'ABCDEF';

/** Rounds escalate: bigger van, more stops, more traffic, and later more parcels than fit. */
export function generateRound(n: number, rng: Rng): RoundDef {
  const cols = n >= 2 ? 7 : 6;
  const rows = n >= 4 ? 5 : 4;
  const stopCount = Math.min(5, 2 + n);
  const traffic = Math.min(14, 4 + 2 * n);

  const shapes = partition(cols, rows, rng);
  const extra = n >= 3 ? Math.min(3, n - 2) : 0;
  for (let i = 0; i < extra; i++) shapes.push(partition(3, 2, rng, randInt(rng, 2, 3))[0]);

  const ordered = shuffle(rng, shapes).map(normalize);
  const parcels: Parcel[] = ordered.map((shape, i) => ({
    id: i,
    shape,
    stop: i < stopCount ? i : Math.floor(rng() * stopCount),
  }));
  return { n, cols, rows, stopCount, parcels: shuffle(rng, parcels), city: buildCity(rng, stopCount, traffic) };
}

/**
 * The guided first delivery: a 4×2 van, 2 stops, 4 parcels that fit exactly with no
 * door blocks only if A goes by the door. A1 arrives sideways, so rotating is required.
 */
export function tutorialRound(city: City): RoundDef {
  const parcels: Parcel[] = [
    { id: 0, shape: [[0, 0], [1, 0], [2, 0]], stop: 1 }, // B, long
    { id: 1, shape: [[0, 0], [1, 0]], stop: 0 }, // A, must be rotated upright
    { id: 2, shape: [[0, 0], [1, 0]], stop: 1 }, // B, short
    { id: 3, shape: [[0, 0]], stop: 0 }, // A, single
  ];
  return { n: 0, cols: 4, rows: 2, stopCount: 2, parcels, city };
}
