import { readFileSync } from 'node:fs';
import { expect, Page, test } from '@playwright/test';

async function tap(page: Page, gx: number, gy: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  const k = box.width / 720;
  await page.mouse.click(box.x + gx * k, box.y + gy * k);
  await page.waitForTimeout(250);
}

const scenes = (page: Page) =>
  page.evaluate(() => ((window as any).__vanful ? (window as any).__vanful.scene.getScenes(true).map((s: any) => s.scene.key) : []) as string[]);

async function returningPlayer(page: Page, path = '/') {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('vanful.tutorial', '1');
  });
  await page.goto(path);
  await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('Title');
}

const dailyParcels = (page: Page) =>
  page.evaluate(() => JSON.stringify((window as any).__vanful.scene.getScene('Game').round.parcels));

test('Daily Load: same load for everyone, one scored run, streak and a spoiler-free share', async ({ page, browser }) => {
  await returningPlayer(page, '/?shift=8');
  await page.keyboard.press('d');
  await expect.poll(() => scenes(page)).toContain('Game');
  const mine = await dailyParcels(page);

  // A different player (fresh browser profile) gets the same parcels today.
  const other = await (await browser.newContext({ baseURL: 'http://localhost:4174' })).newPage();
  await returningPlayer(other, '/?shift=8');
  await other.keyboard.press('d');
  await expect.poll(() => scenes(other)).toContain('Game');
  expect(await dailyParcels(other)).toBe(mine);

  // The short test shift runs out → Game Over shows the daily result.
  await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('GameOver');
  const saved = await page.evaluate(() => ({
    streak: JSON.parse(localStorage.getItem('vanful.streak') || 'null'),
    days: Object.keys(localStorage).filter((k) => k.startsWith('vanful.daily.')).length,
  }));
  expect(saved.streak.count).toBe(1);
  expect(saved.days).toBe(1);

  await tap(page, 360, 890); // Share my Daily
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toMatch(/^Vanful Daily #\d+ · ⭐ \d+\n[🟩🟨⬜]+\nhttp:\/\/localhost:4174\//u);
  await page.screenshot({ path: `launch/screens/v3-daily-over-${test.info().project.name}.png` });

  // Back home: today's Daily is done and can't be replayed for score.
  await tap(page, 360, 1215);
  await expect.poll(() => scenes(page)).toContain('Title');
  await page.keyboard.press('d');
  await page.waitForTimeout(400);
  expect(await scenes(page)).toContain('Title');
  await page.screenshot({ path: `launch/screens/v3-title-${test.info().project.name}.png` });
});

test('Garage: streak paint stays locked, the supporter code unlocks Sunset', async ({ page }) => {
  await returningPlayer(page);
  await tap(page, 360, 975); // Garage
  await expect.poll(() => scenes(page)).toContain('Garage');

  await tap(page, 360, 560); // Night Shift (locked without a 3-day streak)
  expect(await page.evaluate(() => localStorage.getItem('vanful.paint'))).toBeNull();

  await tap(page, 360, 1050); // Enter supporter code
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('WRONG-CODE');
  await dialog.getByRole('button', { name: 'Unlock' }).click();
  await expect(dialog.getByRole('alert')).toContainText("didn't work");
  const code = readFileSync('go-to-market/SUPPORTER_CODE.local.txt', 'utf8').trim();
  await dialog.getByRole('textbox').fill(code.toLowerCase()); // case-insensitive
  await dialog.getByRole('button', { name: 'Unlock' }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => [localStorage.getItem('vanful.supporter'), localStorage.getItem('vanful.paint')])).toEqual(['1', 'sunset']);
  await page.screenshot({ path: `launch/screens/v3-garage-${test.info().project.name}.png` });
});

test('Email capture: validates, posts to the waitlist, and typing never leaks into the game', async ({ page }) => {
  const posted: string[] = [];
  await page.route('https://waitlist.test/rest/v1/waitlist', async (route) => {
    posted.push(route.request().postData() || '');
    await route.fulfill({ status: 201, body: '' });
  });
  await returningPlayer(page, '/?shift=4');
  await page.evaluate(() => localStorage.setItem('vanful.feedback', '1')); // feedback already given → email offer shows
  await page.keyboard.press('Enter'); // normal shift
  await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('GameOver');

  await tap(page, 360, 1000); // New modes by email
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Unsubscribe');
  await dialog.getByRole('textbox').fill('nope');
  await dialog.getByRole('textbox').press('Enter'); // must not trigger "Play again" behind the dialog
  await page.waitForTimeout(300);
  expect(await scenes(page)).toContain('GameOver');
  expect(posted).toHaveLength(0); // the browser's own email validation blocks it

  await dialog.getByRole('textbox').fill('Player@Example.com');
  await dialog.getByRole('button', { name: 'Sign me up' }).click();
  await expect(dialog).toBeHidden();
  expect(JSON.parse(posted[0])).toEqual({ email: 'player@example.com', source: 'gameover' });
  expect(await page.evaluate(() => localStorage.getItem('vanful.emailJoined'))).toBe('1');
});
