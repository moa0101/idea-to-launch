// Where a player came from, so a public launch can be measured per channel.
// Anonymous: a portal name and an optional short ?ref= tag from our own post links. No referrer URL is stored.
export type Channel = 'web' | 'itch' | 'crazygames' | 'poki' | 'dev' | 'other';

const PORTALS: [RegExp, Channel][] = [
  [/(^|\.)itch\.(zone|io)$/, 'itch'],
  [/(^|\.)crazygames\.com$/, 'crazygames'],
  [/(^|\.)(poki\.com|poki-gdn\.com)$/, 'poki'],
];
export const PUBLIC_URL = 'https://vanful.vercel.app';

export function detectChannel(host: string, ancestors: string[] = [], build = ''): Channel {
  if (build === 'itch' || build === 'crazygames' || build === 'poki') return build;
  for (const h of [host, ...ancestors]) for (const [re, ch] of PORTALS) if (re.test(h)) return ch;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.test')) return 'dev';
  if (host === 'vanful.vercel.app' || host.endsWith('.vercel.app')) return 'web';
  return host ? 'other' : 'dev';
}

/** A short tag from our own launch links (?ref=hn). Anything else is dropped. */
export function cleanRef(search: string): string | undefined {
  const r = new URLSearchParams(search).get('ref')?.toLowerCase() ?? '';
  return /^[a-z0-9_-]{1,24}$/.test(r) ? r : undefined;
}

/** The link players share: our public page, never a portal's iframe address. Portals that forbid outside links get none. */
export function shareUrl(ch: Channel, here: string): string {
  if (ch === 'web' || ch === 'dev') return here;
  if (ch === 'itch' || ch === 'other') return PUBLIC_URL;
  return '';
}
/** Email capture only on our own site and itch; CrazyGames/Poki Basic Launch don't allow outside sign-ups. */
export const emailAllowed = (ch: Channel) => ch !== 'crazygames' && ch !== 'poki';
/** The creator's site. A clickable link only where outside links are allowed; plain text on CrazyGames/Poki. */
export const CREATOR = { name: 'cowfounder.com', url: 'https://cowfounder.com' };
export const outsideLinksAllowed = emailAllowed;

const hostOf = (u: string) => {
  try {
    return new URL(u).hostname;
  } catch {
    return '';
  }
};
function ancestorHosts(): string[] {
  if (typeof location === 'undefined') return [];
  const list = Array.from((location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins ?? []);
  if (typeof document !== 'undefined' && document.referrer) list.push(document.referrer);
  return list.map(hostOf).filter(Boolean);
}

export const CHANNEL: Channel =
  typeof location === 'undefined' ? 'dev' : detectChannel(location.hostname, ancestorHosts(), (import.meta.env.VITE_CHANNEL as string | undefined) ?? '');
export const REF = typeof location === 'undefined' ? undefined : cleanRef(location.search);
