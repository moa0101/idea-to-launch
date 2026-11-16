// Anonymous play data for playtests. No names, emails or IPs in the payload: a random device id
// (kept in this browser), a random session id per visit, the event name and small numeric props.
// Off when the player turns it off in About, or when the browser sends Do-Not-Track / Global Privacy Control.
import { APP_VERSION, backendEnabled, insert } from './backend';
import { CHANNEL, REF } from './channel';
import { load, save } from './storage';
import type { EventName } from './track';

const nav = (typeof navigator !== 'undefined' ? navigator : {}) as Navigator & { globalPrivacyControl?: boolean };
export const browserOptOut = () => nav.doNotTrack === '1' || nav.globalPrivacyControl === true;

/** The player's choice wins; otherwise default on, unless the browser signals an opt-out. */
export function sharingOn(): boolean {
  const choice = load('vanful.share', '');
  if (choice) return choice === '1';
  return !browserOptOut();
}
export const setSharing = (on: boolean) => {
  save('vanful.share', on ? '1' : '0');
  if (!on) queue.length = 0;
};
export const telemetryActive = () => backendEnabled() && sharingOn();

const uuid = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export function deviceId(): string {
  let id = load('vanful.device', '');
  if (!id) {
    id = uuid();
    save('vanful.device', id);
  }
  return id;
}
const session = uuid();

interface Row { device: string; session: string; event: EventName; props: Record<string, unknown>; app_version: string; client_ts: string }
const queue: Row[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function sendEvent(event: EventName, props?: Record<string, unknown>) {
  if (!telemetryActive()) return;
  queue.push({ device: deviceId(), session, event, props: { ...props, ch: CHANNEL, ...(REF ? { ref: REF } : {}) }, app_version: APP_VERSION, client_ts: new Date().toISOString() });
  if (queue.length >= 20) void flush();
  else timer ??= setTimeout(() => void flush(), 3000);
}

export async function flush(keepalive = false) {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length || !telemetryActive()) return;
  const batch = queue.splice(0, queue.length);
  const status = await insert('play_events', batch, { keepalive });
  if (status === 0 && queue.length < 200) queue.unshift(...batch); // offline: retry later
}

if (typeof addEventListener === 'function') {
  addEventListener('pagehide', () => void flush(true));
  addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && void flush(true));
}
