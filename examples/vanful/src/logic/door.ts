import { Cargo } from './cargo';

/**
 * The door rule: the door is the right edge of the cargo grid. A parcel for `stop`
 * is blocked if any of its cells has, further right in the same row, a cell of a
 * parcel bound for a different (later) stop. Parcels for the same stop unload together.
 */
export function blockedForStop(cargo: Cargo, stopOf: (id: number) => number, stop: number): number[] {
  const blocked = new Set<number>();
  for (let y = 0; y < cargo.rows; y++) {
    for (let x = 0; x < cargo.cols; x++) {
      const p = cargo.cells[y][x];
      if (p === -1 || stopOf(p) !== stop || blocked.has(p)) continue;
      for (let x2 = x + 1; x2 < cargo.cols; x2++) {
        const q = cargo.cells[y][x2];
        if (q !== -1 && q !== p && stopOf(q) !== stop) {
          blocked.add(p);
          break;
        }
      }
    }
  }
  return [...blocked];
}

export interface UnloadStep {
  stop: number;
  delivered: number[];
  blocked: number[];
}

/** Simulate unloading stop by stop in visit order. Does not mutate `cargo`. */
export function simulateUnload(cargo: Cargo, stopOf: (id: number) => number, order: number[]): UnloadStep[] {
  const c = cargo.clone();
  return order.map((stop) => {
    const blocked = blockedForStop(c, stopOf, stop);
    const delivered = c.ids().filter((id) => stopOf(id) === stop);
    delivered.forEach((id) => c.remove(id));
    return { stop, delivered, blocked };
  });
}
