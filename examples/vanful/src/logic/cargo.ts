import type { Cell } from './shapes';

/** The van's cargo grid. Each cell holds a parcel id or -1. The door is the right edge. */
export class Cargo {
  cells: number[][];
  constructor(public cols: number, public rows: number) {
    this.cells = Array.from({ length: rows }, () => Array(cols).fill(-1));
  }

  clone(): Cargo {
    const c = new Cargo(this.cols, this.rows);
    c.cells = this.cells.map((r) => r.slice());
    return c;
  }

  canPlace(shape: Cell[], ox: number, oy: number, ignoreId = -1): boolean {
    for (const [x, y] of shape) {
      const gx = ox + x, gy = oy + y;
      if (gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rows) return false;
      const occ = this.cells[gy][gx];
      if (occ !== -1 && occ !== ignoreId) return false;
    }
    return true;
  }

  place(id: number, shape: Cell[], ox: number, oy: number) {
    for (const [x, y] of shape) this.cells[oy + y][ox + x] = id;
  }

  remove(id: number) {
    for (const row of this.cells) for (let x = 0; x < row.length; x++) if (row[x] === id) row[x] = -1;
  }

  ids(): number[] {
    return [...new Set(this.cells.flat().filter((v) => v !== -1))];
  }

  filled(): number {
    return this.cells.flat().filter((v) => v !== -1).length;
  }
}
