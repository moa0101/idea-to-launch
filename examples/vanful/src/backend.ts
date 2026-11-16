// One place for the (optional) Supabase backend. Browser access is insert-only (see supabase/migrations).
// Configure with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Without both, nothing is ever sent.

const BASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const APP_VERSION = 'v5';

export const backendEnabled = () => !!(BASE && KEY);

/** POST rows to a table. Returns the HTTP status (0 on network error or when disabled). */
export async function insert(table: string, rows: object | object[], opts: { fetcher?: typeof fetch; keepalive?: boolean } = {}): Promise<number> {
  if (!BASE || !KEY) return 0;
  try {
    const res = await (opts.fetcher ?? fetch)(`${BASE}/rest/v1/${table}`, {
      method: 'POST',
      keepalive: opts.keepalive,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(rows),
    });
    return res.status;
  } catch {
    return 0;
  }
}
