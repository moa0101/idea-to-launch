import { load, save } from './storage';

/**
 * Privacy-friendly event log: kept locally, and sent anonymously via telemetry.ts only when a backend is configured and the player allows it.
 * The last 500 events live in localStorage; open the game with `?stats` to see counts.
 * To send events to an analytics provider later, set `provider` (needs an account: ask first).
 */
export type EventName =
  | 'shift_start'
  | 'tutorial_start'
  | 'tutorial_step'
  | 'tutorial_done'
  | 'tutorial_skip'
  | 'pack_done'
  | 'route_set'
  | 'round_done'
  | 'shift_over'
  | 'play_again'
  | 'copy_score'
  | 'undo'
  | 'daily_start'
  | 'daily_done'
  | 'paint_select'
  | 'supporter_unlock'
  | 'email_join'
  | 'feedback_sent';

interface Entry { e: EventName; t: number; p?: Record<string, number | string | boolean> }

const KEY = 'vanful.events';
const MAX = 500;

export let provider: ((e: EventName, p?: Entry['p']) => void) | null = null;
export const setProvider = (fn: typeof provider) => (provider = fn);

export function track(e: EventName, p?: Entry['p']) {
  let log: Entry[] = [];
  try {
    log = JSON.parse(load(KEY, '[]'));
  } catch {
    log = [];
  }
  log.push({ e, t: Date.now(), p });
  save(KEY, JSON.stringify(log.slice(-MAX)));
  provider?.(e, p);
  if (import.meta.env.DEV) console.debug('[track]', e, p ?? '');
}

export function eventCounts(): Record<string, number> {
  try {
    const log: Entry[] = JSON.parse(load(KEY, '[]'));
    return log.reduce<Record<string, number>>((acc, x) => ((acc[x.e] = (acc[x.e] ?? 0) + 1), acc), {});
  } catch {
    return {};
  }
}
