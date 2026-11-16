import { expect, Page } from '@playwright/test';

export async function toPage(page: Page, gx: number, gy: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  const k = box.width / 720;
  return { x: box.x + gx * k, y: box.y + gy * k };
}
export async function tap(page: Page, gx: number, gy: number) {
  const p = await toPage(page, gx, gy);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
}
export const scenes = (page: Page) =>
  page.evaluate(() => ((window as any).__vanful ? (window as any).__vanful.scene.getScenes(true).map((s: any) => s.scene.key) : []) as string[]);
const gameState = (page: Page) =>
  page.evaluate(() => {
    const s = (window as any).__vanful.scene.getScene('Game');
    return { step: s.tutStep as number, phase: s.phase as string, tutorial: s.tutorial as boolean };
  });

export async function dragParcel(page: Page, id: number, col: number, row: number) {
  await page.waitForTimeout(300);
  const at = await page.evaluate((id) => {
    const s = (window as any).__vanful.scene.getScene('Game');
    const v = s.views.find((x: any) => x.p.id === id);
    const [cx, cy] = v.shape[0];
    return { x: v.c.x + (cx * 80 + 40) * v.c.scale, y: v.c.y + (cy * 80 + 40) * v.c.scale, cx, cy };
  }, id);
  const gx = await page.evaluate(() => (window as any).__vanful.scene.getScene('Game').GX);
  const from = await toPage(page, at.x, at.y);
  const to = await toPage(page, gx + (col + at.cx) * 80 + 40, 230 + (row + at.cy) * 80 + 40);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

/** Plays the guided first delivery from the HTML front door to "Start shift". */
export async function playTutorial(page: Page, snap: (moment: string) => Promise<void> = async () => {}) {
  const play = page.getByRole('button', { name: 'Play free' });
  if ((await play.isVisible()) && (await play.isEnabled())) await play.click();
  await expect.poll(async () => (await page.evaluate(() => !!(window as any).__vanful)) && (await gameState(page)).tutorial, { timeout: 20_000 }).toBe(true);
  await page.waitForTimeout(300);
  await dragParcel(page, 0, 0, 0);
  const a = await page.evaluate(() => {
    const v = (window as any).__vanful.scene.getScene('Game').views.find((x: any) => x.p.id === 1);
    return { x: v.c.x + 40 * v.c.scale, y: v.c.y + 40 * v.c.scale };
  });
  await tap(page, a.x, a.y);
  await dragParcel(page, 1, 3, 0);
  await snap('packing');
  await dragParcel(page, 2, 0, 1);
  await dragParcel(page, 3, 2, 1);
  await snap('packed');
  await tap(page, 455, 1210);
  const houses = await page.evaluate(() => {
    const s = (window as any).__vanful.scene.getScene('Game');
    return s.round.city.stops.map((n: number) => s.nodePos(s.round.city, n));
  });
  await tap(page, houses[0].x, houses[0].y);
  await tap(page, houses[1].x, houses[1].y);
  await snap('route');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await gameState(page)).phase, { timeout: 20_000 }).toBe('result');
  await snap('result');
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await gameState(page)).tutorial).toBe(false);
}
