// Email capture → the insert-only `waitlist` table.
import { backendEnabled, insert } from './backend';
import { CHANNEL, emailAllowed } from './channel';

export const waitlistEnabled = () => backendEnabled() && emailAllowed(CHANNEL);

export const validEmail = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(e.trim()) && e.length <= 254;

export type JoinResult = 'ok' | 'invalid' | 'already' | 'error' | 'disabled';

export async function joinWaitlist(email: string, source: string, fetcher?: typeof fetch): Promise<JoinResult> {
  if (!backendEnabled()) return 'disabled';
  if (!validEmail(email)) return 'invalid';
  const status = await insert('waitlist', { email: email.trim().toLowerCase(), source }, { fetcher });
  if (status >= 200 && status < 300) return 'ok';
  if (status === 409) return 'already';
  return 'error';
}
