import { CFG } from '../config';
import { Rng, shuffle } from './rng';

export interface Edge { a: number; b: number; traffic: boolean; w: number }

export interface City {
  cols: number;
  rows: number;
  edges: Edge[];
  adj: number[][]; // node -> edge indices
  depot: number;
  stops: number[]; // stop index -> node id
}

export const nodeXY = (city: City, id: number) => ({ x: id % city.cols, y: Math.floor(id / city.cols) });

export function buildCity(rng: Rng, nStops: number, nTraffic: number, cols = 5, rows = 6): City {
  const id = (x: number, y: number) => y * cols + x;
  const edges: Edge[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      if (x + 1 < cols) edges.push({ a: id(x, y), b: id(x + 1, y), traffic: false, w: CFG.EDGE_MIN });
      if (y + 1 < rows) edges.push({ a: id(x, y), b: id(x, y + 1), traffic: false, w: CFG.EDGE_MIN });
    }
  for (const i of shuffle(rng, edges.map((_, i) => i)).slice(0, nTraffic)) {
    edges[i].traffic = true;
    edges[i].w = CFG.EDGE_MIN * CFG.TRAFFIC_MULT;
  }
  const adj: number[][] = Array.from({ length: cols * rows }, () => []);
  edges.forEach((e, i) => { adj[e.a].push(i); adj[e.b].push(i); });
  const depot = id(0, rows - 1);
  // stops: distinct nodes, not the depot or right next to it
  const candidates = shuffle(rng, adj.map((_, i) => i)).filter((n) => {
    const x = n % cols, y = Math.floor(n / cols);
    return Math.abs(x - 0) + Math.abs(y - (rows - 1)) >= 2;
  });
  return { cols, rows, edges, adj, depot, stops: candidates.slice(0, nStops) };
}

/** Dijkstra from one node; returns distance and previous-edge arrays. */
export function shortest(city: City, from: number) {
  const n = city.adj.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const done = Array(n).fill(false);
  dist[from] = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1 || dist[u] === Infinity) break;
    done[u] = true;
    for (const ei of city.adj[u]) {
      const e = city.edges[ei];
      const v = e.a === u ? e.b : e.a;
      if (dist[u] + e.w < dist[v]) { dist[v] = dist[u] + e.w; prev[v] = ei; }
    }
  }
  return { dist, prev };
}

/** Node path (inclusive) and minutes from `from` to `to`. */
export function path(city: City, from: number, to: number) {
  const { dist, prev } = shortest(city, from);
  const nodes = [to];
  let cur = to;
  while (cur !== from) {
    const e = city.edges[prev[cur]];
    cur = e.a === cur ? e.b : e.a;
    nodes.unshift(cur);
  }
  return { nodes, minutes: dist[to] as number };
}

/** Minutes for depot → stops in `order` (stop indices). */
export function routeMinutes(city: City, order: number[]): number {
  let at = city.depot, total = 0;
  for (const s of order) {
    total += path(city, at, city.stops[s]).minutes;
    at = city.stops[s];
  }
  return total;
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Fastest possible order over a set of stops (≤ 6 stops → ≤ 720 permutations). */
export function bestRoute(city: City, stops: number[]) {
  let best = { order: stops, minutes: Infinity };
  for (const p of permutations(stops)) {
    const m = routeMinutes(city, p);
    if (m < best.minutes) best = { order: p, minutes: m };
  }
  return best;
}
