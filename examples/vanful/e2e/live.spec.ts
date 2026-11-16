import { expect, Page, test } from '@playwright/test';
import { playTutorial, scenes } from './helpers';

// Live smoke tests. Every request to Supabase is intercepted and answered locally,
// so these tests NEVER write into the real playtest database.
const SUPABASE = '**/*.supabase.co/rest/v1/**';

async function captureBackend(page: Page) {
  const sent: { table: string; rows: any[] }[] = [];
  await page.route(SUPABASE, async (route) => {
    const req = route.request();
    sent.push({ table: new URL(req.url()).pathname.split('/').pop()!, rows: [].concat(JSON.parse(req.postData() || '[]')) });
    await route.fulfill({ status: 201, body: '' });
  });
  return sent;
}

test('the live game sends anonymous play events (intercepted, nothing stored)', async ({ page }) => {
  const sent = await captureBackend(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await playTutorial(page);
  await page.evaluate(() => dispatchEvent(new Event('pagehide')));
  const events = () => sent.flatMap((s) => s.rows).map((r) => r.event);
  await expect.poll(events).toEqual(expect.arrayContaining(['tutorial_start', 'tutorial_done', 'round_done', 'shift_start']));
  const rows = sent.flatMap((s) => s.rows);
  for (const r of rows) expect(Object.keys(r).sort()).toEqual(['app_version', 'client_ts', 'device', 'event', 'props', 'session']);
  expect(rows[0].app_version).toMatch(/^v\d+$/);
  // From v5 on, every event says where the player came from.
  if (rows[0].app_version !== 'v4') expect(rows.every((r) => r.props.ch === 'web')).toBe(true);
});

test('Global Privacy Control means the live game sends nothing', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true }));
  const sent = await captureBackend(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await playTutorial(page);
  await page.evaluate(() => dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(800);
  expect(await scenes(page)).toContain('Game');
  expect(sent).toHaveLength(0);
});
