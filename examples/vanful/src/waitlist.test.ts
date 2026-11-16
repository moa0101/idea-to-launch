import { describe, expect, it, vi } from 'vitest';

describe('waitlist', () => {
  it('is hidden without configuration', async () => {
    // Independent of the developer's .env.local (which may hold real values).
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const m = await import('./waitlist');
    expect(m.waitlistEnabled()).toBe(false);
    expect(await m.joinWaitlist('a@b.co', 'test')).toBe('disabled');
  });
  it('validates and posts {email, source} when configured', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co/');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    const m = await import('./waitlist');
    expect(m.waitlistEnabled()).toBe(true);
    expect(await m.joinWaitlist('not-an-email', 's')).toBe('invalid');
    const fetcher = vi.fn(async () => new Response(null, { status: 201 }));
    expect(await m.joinWaitlist(' Me@Example.com ', 'gameover', fetcher as unknown as typeof fetch)).toBe('ok');
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://demo.supabase.co/rest/v1/waitlist');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'me@example.com', source: 'gameover' });
    const dup = vi.fn(async () => new Response(null, { status: 409 }));
    expect(await m.joinWaitlist('me@example.com', 'x', dup as unknown as typeof fetch)).toBe('already');
    vi.unstubAllEnvs();
  });
});
