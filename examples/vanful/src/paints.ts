// Van paints for the Garage. Cosmetic only: nothing that affects score.
export type Unlock = 'free' | 'streak3' | 'supporter';

export interface Paint { id: string; name: string; body: number; hex: string; unlock: Unlock; how: string }

export const PAINTS: Paint[] = [
  { id: 'classic', name: 'Classic', body: 0x0f766e, hex: '#0F766E', unlock: 'free', how: 'Free' },
  { id: 'night', name: 'Night Shift', body: 0x4338ca, hex: '#4338CA', unlock: 'streak3', how: '3-day Daily streak' },
  { id: 'sunset', name: 'Sunset', body: 0xe4572e, hex: '#E4572E', unlock: 'supporter', how: 'Supporter pack' },
];

/**
 * Supporter codes are checked against SHA-256 hashes, so the code itself isn't in the build.
 * This is an honour system for a cosmetic reward, not DRM. The code lives in
 * go-to-market/SUPPORTER_CODE.local.txt (git-ignored); share it as the supporter pack's reward.
 */
const SUPPORTER_HASHES = new Set(['53ebf30f4c26f1d9074b72ccd460c6f3ecdac1ca0a7903facaa8210061bf3d7c']);

export async function checkSupporterCode(code: string): Promise<boolean> {
  const norm = code.trim().toUpperCase();
  if (!norm || !globalThis.crypto?.subtle) return false;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return SUPPORTER_HASHES.has(hex);
}

export function isUnlocked(p: Paint, s: { streak: number; supporter: boolean }) {
  return p.unlock === 'free' || (p.unlock === 'streak3' && s.streak >= 3) || (p.unlock === 'supporter' && s.supporter);
}
