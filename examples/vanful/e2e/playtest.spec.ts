import { expect, Page, test } from '@playwright/test';
import { playTutorial, scenes, tap } from './helpers';

// Runs against a REAL local PostgREST + Postgres with the production migrations (npm run e2e:backend).
// The game build points at https://waitlist.test; requests are forwarded to the local API as the anon role.
const API = process.env.PGRST_URL;
test.skip(!API, 'needs the local backend: npm run e2e:backend');

async function forwardToLocalApi(page: Page, log: { table: string; status: number }[]) {
  await page.route('https://waitlist.test/rest/v1/**', async (route) => {
    const req = route.request();
    const table = new URL(req.url()).pathname.replace('/rest/v1/', '');
    const headers = { ...req.headers() };
    delete headers.authorization; // PostgREST then uses its anon role, like Supabase's public key
    delete headers.apikey;
    const res = await route.fetch({ url: `${API}/${table}`, headers });
    log.push({ table, status: res.status() });
    await route.fulfill({ response: res });
  });
}

test("a new player's session lands in the database, and their feedback too", async ({ page }) => {
  const log: { table: string; status: number }[] = [];
  await forwardToLocalApi(page, log);
  await page.goto('/?shift=6');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await playTutorial(page); // then a real 6-second shift starts
  await expect.poll(() => scenes(page), { timeout: 30_000 }).toContain('GameOver');

  await tap(page, 360, 1000); // 💬 3 quick questions
  const d = page.getByRole('dialog');
  await d.getByLabel('Yes').first().check();
  await d.getByRole('group', { name: /How fun/ }).getByLabel('4').check();
  await d.getByRole('group', { name: /tomorrow/ }).getByLabel('Maybe').check();
  await d.getByRole('textbox').fill('The door idea clicked on the second round.');
  await d.getByRole('textbox').press('Enter'); // newline in the textarea, must not restart the game
  expect(await scenes(page)).toContain('GameOver');
  await d.getByRole('button', { name: 'Send' }).click();
  await expect(d).toBeHidden();
  await page.evaluate(() => dispatchEvent(new Event('pagehide'))); // flush queued events

  await expect.poll(() => log.filter((l) => l.table === 'play_events' && l.status === 201).length).toBeGreaterThan(0);
  expect(log.find((l) => l.table === 'feedback')?.status).toBe(201);
  expect(log.every((l) => l.status < 400)).toBe(true);
  await page.screenshot({ path: `launch/screens/v4-feedback-done-${test.info().project.name}.png` });
});

test('switching anonymous play data off in About stops every request', async ({ page }) => {
  const log: { table: string; status: number }[] = [];
  await forwardToLocalApi(page, log);
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('vanful.tutorial', '1');
  });
  await page.reload();
  await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('Title');
  await tap(page, 585, 975); // About
  await tap(page, 360, 1040); // Anonymous play data: On → Off
  expect(await page.evaluate(() => localStorage.getItem('vanful.share'))).toBe('0');
  await page.screenshot({ path: `launch/screens/v4-about-${test.info().project.name}.png` });
  await tap(page, 360, 1210); // Back
  await page.keyboard.press('Enter'); // play a shift
  await page.waitForTimeout(1500);
  await page.evaluate(() => dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(500);
  expect(log).toHaveLength(0);
});
