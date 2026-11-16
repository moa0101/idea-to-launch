import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.resetModules();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
  vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('telemetry consent', () => {
  it('is on by default, and off when the browser sends Do-Not-Track or GPC', async () => {
    vi.stubGlobal('navigator', {});
    expect((await import('./telemetry')).sharingOn()).toBe(true);
    vi.resetModules();
    vi.stubGlobal('navigator', { doNotTrack: '1' });
    expect((await import('./telemetry')).sharingOn()).toBe(false);
    vi.resetModules();
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    expect((await import('./telemetry')).sharingOn()).toBe(false);
  });

  it("the player's own choice wins over the browser signal", async () => {
    vi.stubGlobal('navigator', { doNotTrack: '1' });
    const t = await import('./telemetry');
    t.setSharing(true);
    expect(t.sharingOn()).toBe(true);
    t.setSharing(false);
    expect(t.sharingOn()).toBe(false);
  });
});

describe('telemetry sending', () => {
  it('batches anonymous rows (no PII fields) and sends nothing when off', async () => {
    vi.stubGlobal('navigator', {});
    const fetcher = vi.fn(async () => new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    const t = await import('./telemetry');
    t.sendEvent('shift_start');
    t.sendEvent('round_done', { round: 1, delivered: 6 });
    await t.flush();
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://demo.supabase.co/rest/v1/play_events');
    const rows = JSON.parse(init.body as string);
    expect(rows).toHaveLength(2);
    expect(Object.keys(rows[0]).sort()).toEqual(['app_version', 'client_ts', 'device', 'event', 'props', 'session']);
    expect(rows[0].device).toBe(rows[1].device);

    t.setSharing(false);
    t.sendEvent('undo');
    await t.flush();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
