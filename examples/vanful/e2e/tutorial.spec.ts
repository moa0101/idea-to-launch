import { expect, Page, test } from '@playwright/test';

// Game-space (720×1280) → page pixels, using the canvas's on-screen box.
async function toPage(page: Page, gx: number, gy: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  const k = box.width / 720;
  return { x: box.x + gx * k, y: box.y + gy * k };
}

async function tap(page: Page, gx: number, gy: number) {
  const p = await toPage(page, gx, gy);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
}

const game = (page: Page) =>
  page.evaluate(() => {
    const g = (window as any).__vanful;
    const s = g.scene.getScene('Game');
    return {
      active: g.scene.getScenes(true).map((x: any) => x.scene.key) as string[],
      step: s.tutStep as number,
      phase: s.phase as string,
      tutorial: s.tutorial as boolean,
      filled: s.cargo?.filled() as number,
    };
  });

/** Centre of a parcel's first real cell, in game space, plus that cell's offset in the shape. */
const parcelAt = (page: Page, id: number) =>
  page.evaluate((id) => {
    const s = (window as any).__vanful.scene.getScene('Game');
    const v = s.views.find((x: any) => x.p.id === id);
    const [cx, cy] = v.shape[0];
    return { x: v.c.x + (cx * 80 + 40) * v.c.scale, y: v.c.y + (cy * 80 + 40) * v.c.scale, cx, cy };
  }, id);

/** Drag a parcel so its shape origin lands on van cell (col, row). */
async function dragParcel(page: Page, id: number, col: number, row: number) {
  await page.waitForTimeout(300); // let the tray re-layout settle
  const at = await parcelAt(page, id);
  const from = await toPage(page, at.x, at.y);
  const gx = await page.evaluate(() => (window as any).__vanful.scene.getScene('Game').GX);
  const to = await toPage(page, gx + (col + at.cx) * 80 + 40, 230 + (row + at.cy) * 80 + 40);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

test('a new player completes the guided first delivery, then starts a real shift', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // First visit: the HTML front door's Play button loads the engine and starts the guided delivery.
  expect(await page.evaluate(() => !!(window as any).__vanful)).toBe(false);
  const t0 = Date.now();
  await page.getByRole('button', { name: 'Play free' }).click();
  await expect.poll(async () => (await page.evaluate(() => !!(window as any).__vanful)) && (await game(page)).tutorial, { timeout: 20_000 }).toBe(true);
  await page.waitForTimeout(300);
  expect((await game(page)).step).toBe(0);

  await dragParcel(page, 0, 0, 0); // B long, deep
  expect((await game(page)).step).toBe(1);
  const a = await parcelAt(page, 1);
  await tap(page, a.x, a.y); // rotate A upright
  expect((await game(page)).step).toBe(2);
  await dragParcel(page, 1, 3, 0); // A by the door
  await dragParcel(page, 2, 0, 1); // B short, deep
  await dragParcel(page, 3, 2, 1); // A single, by the door
  expect(await game(page)).toMatchObject({ step: 3, filled: 8 });

  await tap(page, 455, 1210); // Plan route ➜
  expect(await game(page)).toMatchObject({ phase: 'route', step: 4 });
  const houses = await page.evaluate(() => {
    const s = (window as any).__vanful.scene.getScene('Game');
    return s.round.city.stops.map((n: number) => s.nodePos(s.round.city, n));
  });
  await tap(page, houses[0].x, houses[0].y); // A
  await tap(page, houses[1].x, houses[1].y); // B
  expect((await game(page)).step).toBe(5);

  await page.keyboard.press('Space'); // Drive, from the keyboard
  await expect.poll(async () => (await game(page)).phase, { timeout: 20_000 }).toBe('result');
  const secs = (Date.now() - t0) / 1000;
  await page.screenshot({ path: `launch/screens/v2-tutorial-done-${test.info().project.name}.png` });

  await page.keyboard.press('Enter'); // Start shift ➜
  await expect.poll(async () => (await game(page)).tutorial).toBe(false);
  expect(await game(page)).toMatchObject({ phase: 'pack', step: -1 });

  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('vanful.events') || '[]').map((e: any) => e.e));
  expect(events).toEqual(expect.arrayContaining(['tutorial_start', 'pack_done', 'route_set', 'round_done', 'tutorial_done', 'shift_start']));
  expect(await page.evaluate(() => localStorage.getItem('vanful.tutorial'))).toBe('1');
  console.log(`[${test.info().project.name}] tutorial completed in ${secs.toFixed(1)} s of automated play`);
});

test('undo returns the last parcel; About explains what is stored', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('vanful.tutorial', '1'));
  await page.reload();
  await expect.poll(async () => (await page.evaluate(() => !!(window as any).__vanful)) && (await game(page)).active.includes('Title'), { timeout: 20_000 }).toBe(true);
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await game(page)).active.includes('Game')).toBe(true);
  await dragParcel(page, (await page.evaluate(() => (window as any).__vanful.scene.getScene('Game').views[0].p.id)), 0, 0);
  const filled = (await game(page)).filled;
  expect(filled).toBeGreaterThan(0);
  await page.keyboard.press('z');
  await page.waitForTimeout(200);
  expect((await game(page)).filled).toBe(0);

  await page.goto('/?stats');
  await expect.poll(async () => (await page.evaluate(() => !!(window as any).__vanful)) && (await game(page)).active.includes('Title'), { timeout: 20_000 }).toBe(true);
  await tap(page, 585, 975); // About (v3 title layout)
  await expect.poll(async () => (await game(page)).active.includes('About')).toBe(true);
  await page.screenshot({ path: `launch/screens/v2-about-${test.info().project.name}.png` });
});

test('HTML intro is real, readable content and the page never scrolls sideways', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Vanful' })).toBeAttached();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://vanful.vercel.app/og.png');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `launch/screens/v2-front-door-${test.info().project.name}.png` });
  await page.getByRole('button', { name: 'Play free' }).click();
  await expect.poll(async () => page.evaluate(() => document.body.classList.contains('ready')), { timeout: 20_000 }).toBe(true);
  
});
