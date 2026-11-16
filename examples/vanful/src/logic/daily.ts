// The Daily Load: one shared, date-seeded shift per UTC day. Pure functions, unit-tested.

/** Day #1 of the Daily Load. */
export const DAILY_EPOCH = '2026-11-13';

export function dateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10); // UTC YYYY-MM-DD
}

export function dayNumber(key: string): number {
  return Math.round((Date.parse(key) - Date.parse(DAILY_EPOCH)) / 86_400_000) + 1;
}

/** FNV-1a: the same date gives everyone the same seed. */
export function seedFor(key: string): number {
  let h = 0x811c9dc5;
  for (const ch of `vanful-daily-${key}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export interface Streak { last: string; count: number }

/** Streak after completing the daily on `today`. Consecutive days add one; a gap resets to 1. */
export function nextStreak(prev: Streak | null, today: string): Streak {
  if (!prev) return { last: today, count: 1 };
  if (prev.last === today) return prev;
  const gap = dayNumber(today) - dayNumber(prev.last);
  return { last: today, count: gap === 1 ? prev.count + 1 : 1 };
}

/** The streak as it stands today (0 if the chain broke before yesterday). */
export function currentStreak(prev: Streak | null, today: string): number {
  if (!prev) return 0;
  const gap = dayNumber(today) - dayNumber(prev.last);
  return gap <= 1 ? prev.count : 0;
}

export interface RoundResult { delivered: number; total: number; blocked: number; finished: boolean }

/** One emoji per round: 🟩 every parcel delivered with a clear door, 🟨 delivered with problems, ⬜ unfinished. */
export function roundEmoji(r: RoundResult): string {
  if (!r.finished) return '⬜';
  return r.delivered === r.total && r.blocked === 0 ? '🟩' : '🟨';
}

/** Spoiler-free share text: no parcel shapes or routes, just the outcome. */
export function shareText(o: { day: number; score: number; rounds: RoundResult[]; url: string; streak: number }): string {
  const grid = o.rounds.map(roundEmoji).join('') || '⬜';
  const streak = o.streak > 1 ? ` · 🔥${o.streak}` : '';
  return `Vanful Daily #${o.day} · ⭐ ${o.score}${streak}\n${grid}${o.url ? `\n${o.url}` : ''}`;
}
