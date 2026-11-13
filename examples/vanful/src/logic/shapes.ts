import { Rng, randInt } from './rng';

export type Cell = [number, number];

export function normalize(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map((c) => c[0]));
  const minY = Math.min(...cells.map((c) => c[1]));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Cell)
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

/** Rotate 90° clockwise and re-anchor at (0,0). */
export function rotate(cells: Cell[]): Cell[] {
  return normalize(cells.map(([x, y]) => [-y, x] as Cell));
}

export function bounds(cells: Cell[]) {
  return {
    w: Math.max(...cells.map((c) => c[0])) + 1,
    h: Math.max(...cells.map((c) => c[1])) + 1,
  };
}

const DIRS: Cell[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Split a cols×rows grid into random polyominoes (sizes up to maxSize).
 * Guarantees the returned pieces can tile the grid exactly, so a perfect pack exists.
 */
export function partition(cols: number, rows: number, rng: Rng, maxSize = 4): Cell[][] {
  const owner: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const pieces: Cell[][] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (owner[y][x] !== -1) continue;
      const id = pieces.length;
      const target = rng() < 0.08 ? 1 : randInt(rng, 2, maxSize);
      const piece: Cell[] = [[x, y]];
      owner[y][x] = id;
      while (piece.length < target) {
        const options: Cell[] = [];
        for (const [px, py] of piece) {
          for (const [dx, dy] of DIRS) {
            const nx = px + dx, ny = py + dy;
            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && owner[ny][nx] === -1) options.push([nx, ny]);
          }
        }
        if (!options.length) break;
        const [nx, ny] = options[Math.floor(rng() * options.length)];
        owner[ny][nx] = id;
        piece.push([nx, ny]);
      }
      pieces.push(piece);
    }
  }
  return pieces.map(normalize);
}
