import { describe, expect, it } from 'vitest';
import { Cargo } from './cargo';
import { bestRoute, buildCity, path, routeMinutes } from './city';
import { blockedForStop, simulateUnload } from './door';
import { makeRng } from './rng';
import { generateRound } from './round';
import { Cell, partition, rotate } from './shapes';

describe('shapes', () => {
  it('partition tiles the grid exactly', () => {
    for (let seed = 1; seed < 30; seed++) {
      const pieces = partition(7, 5, makeRng(seed));
      expect(pieces.reduce((s, p) => s + p.length, 0)).toBe(35);
      expect(pieces.every((p) => p.length >= 1 && p.length <= 4)).toBe(true);
    }
  });
  it('rotating 4 times returns the same shape', () => {
    const L: Cell[] = [[0, 0], [0, 1], [0, 2], [1, 2]];
    expect(rotate(rotate(rotate(rotate(L))))).toEqual(L);
    expect(rotate(L)).not.toEqual(L);
  });
});

describe('cargo', () => {
  it('rejects overlap and out-of-bounds', () => {
    const c = new Cargo(3, 2);
    const bar: Cell[] = [[0, 0], [1, 0]];
    expect(c.canPlace(bar, 0, 0)).toBe(true);
    c.place(1, bar, 0, 0);
    expect(c.canPlace(bar, 1, 0)).toBe(false);
    expect(c.canPlace(bar, 1, 0, 1)).toBe(true); // moving itself
    expect(c.canPlace(bar, 2, 1)).toBe(false);
    c.remove(1);
    expect(c.filled()).toBe(0);
  });
});

describe('door rule', () => {
  // row 0: [A][B]  door →   A is behind B
  const c = new Cargo(2, 1);
  c.place(1, [[0, 0]], 0, 0); // stop 0
  c.place(2, [[0, 0]], 1, 0); // stop 1
  const stopOf = (id: number) => (id === 1 ? 0 : 1);
  it('blocks a parcel with a later-stop parcel between it and the door', () => {
    expect(blockedForStop(c, stopOf, 0)).toEqual([1]);
    expect(blockedForStop(c, stopOf, 1)).toEqual([]);
  });
  it('visiting the door-side stop first clears the way', () => {
    const steps = simulateUnload(c, stopOf, [1, 0]);
    expect(steps.flatMap((s) => s.blocked)).toEqual([]);
    expect(steps.flatMap((s) => s.delivered).sort()).toEqual([1, 2]);
    expect(simulateUnload(c, stopOf, [0, 1])[0].blocked).toEqual([1]);
  });
});

describe('city', () => {
  it('shortest paths avoid traffic when cheaper and best route is optimal', () => {
    const city = buildCity(makeRng(7), 4, 10);
    const p = path(city, city.depot, city.stops[0]);
    expect(p.nodes[0]).toBe(city.depot);
    expect(p.nodes[p.nodes.length - 1]).toBe(city.stops[0]);
    const best = bestRoute(city, [0, 1, 2, 3]);
    expect(best.minutes).toBeLessThanOrEqual(routeMinutes(city, [0, 1, 2, 3]));
    expect(best.minutes).toBeLessThanOrEqual(routeMinutes(city, [3, 2, 1, 0]));
  });
});

describe('rounds', () => {
  it('escalate and give every stop at least one parcel', () => {
    const r1 = generateRound(1, makeRng(1));
    const r4 = generateRound(4, makeRng(1));
    expect(r1.cols * r1.rows).toBeLessThan(r4.cols * r4.rows);
    for (const r of [r1, r4]) {
      for (let s = 0; s < r.stopCount; s++) expect(r.parcels.some((p) => p.stop === s)).toBe(true);
      expect(new Set(r.city.stops).size).toBe(r.stopCount);
    }
    const cells1 = r1.parcels.reduce((s, p) => s + p.shape.length, 0);
    expect(cells1).toBe(r1.cols * r1.rows); // round 1 fits exactly
  });
});

import { tutorialRound } from './round';
describe('tutorial round', () => {
  it('has an exact, door-clear solution: B deep, A at the door', () => {
    const r = tutorialRound(buildCity(makeRng(42), 2, 3));
    expect(r.parcels.reduce((s, p) => s + p.shape.length, 0)).toBe(8);
    const c = new Cargo(4, 2);
    c.place(0, r.parcels[0].shape, 0, 0); // B long: row0 cols0-2
    c.place(1, rotate(r.parcels[1].shape), 3, 0); // A upright: col3 rows0-1
    c.place(2, r.parcels[2].shape, 0, 1); // B short: row1 cols0-1
    c.place(3, r.parcels[3].shape, 2, 1); // A single: row1 col2
    expect(c.filled()).toBe(8);
    const stopOf = (id: number) => r.parcels[id].stop;
    expect(simulateUnload(c, stopOf, [0, 1]).flatMap((s) => s.blocked)).toEqual([]);
    expect(simulateUnload(c, stopOf, [1, 0]).flatMap((s) => s.blocked).length).toBeGreaterThan(0);
  });
});

import { currentStreak, dayNumber, nextStreak, seedFor, shareText } from './daily';
describe('daily load', () => {
  it('same date → same seed and same rounds; different date → different', () => {
    expect(seedFor('2026-11-20')).toBe(seedFor('2026-11-20'));
    expect(seedFor('2026-11-20')).not.toBe(seedFor('2026-11-21'));
    const a = generateRound(1, makeRng(seedFor('2026-11-20')));
    const b = generateRound(1, makeRng(seedFor('2026-11-20')));
    expect(JSON.stringify(a.parcels)).toBe(JSON.stringify(b.parcels));
    expect(dayNumber('2026-11-13')).toBe(1);
    expect(dayNumber('2026-11-20')).toBe(8);
  });
  it('streak counts consecutive days and resets after a gap', () => {
    let s = nextStreak(null, '2026-11-20');
    s = nextStreak(s, '2026-11-21');
    s = nextStreak(s, '2026-11-21'); // same day twice: no double count
    expect(s.count).toBe(2);
    expect(currentStreak(s, '2026-11-22')).toBe(2); // still alive today
    expect(currentStreak(s, '2026-11-24')).toBe(0);
    expect(nextStreak(s, '2026-11-24').count).toBe(1);
  });
  it('share text is spoiler-free', () => {
    const t = shareText({ day: 8, score: 820, streak: 3, url: 'https://x.test', rounds: [
      { delivered: 8, total: 8, blocked: 0, finished: true },
      { delivered: 9, total: 11, blocked: 1, finished: true },
      { delivered: 0, total: 12, blocked: 0, finished: false },
    ] });
    expect(t).toBe('Vanful Daily #8 · ⭐ 820 · 🔥3\n🟩🟨⬜\nhttps://x.test');
  });
});
