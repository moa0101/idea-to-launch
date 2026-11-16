// Captures the real game for store pages: 5 portrait screenshots and screencast frames for the videos.
// Serves dist-assets/ (a test build) from https://vanful.test/ via request interception, so nothing touches the network.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { expect, Page, test } from '@playwright/test';
import { playTutorial, scenes } from '../../e2e/helpers';

const OUT = 'go-to-market/assets';
const RAW = 'dist-assets-frames';
const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };

async function serve(page: Page) {
  await page.route('https://vanful.test/**', (route) => {
    const rel = new URL(route.request().url()).pathname.slice(1) || 'index.html';
    const file = join('dist-assets', rel);
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' });
  });
  await page.route('**/rest/v1/**', (r) => r.fulfill({ status: 201 }));
}
const canvasShot = (page: Page, name: string) => page.locator('canvas').screenshot({ path: `${OUT}/${name}.png` });

test('screenshots', async ({ browser }) => {
  mkdirSync(OUT, { recursive: true });
  const page = await (await browser.newContext({ viewport: { width: 720, height: 1280 } })).newPage();
  await serve(page);
  // 1. Title, as a returning player sees it.
  await page.goto('https://vanful.test/');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('vanful.tutorial', '1'); localStorage.setItem('vanful.best', '0'); });
  await page.goto('https://vanful.test/');
  await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('Title');
  await page.waitForTimeout(1200);
  await canvasShot(page, 'screen-1-title');
  // 3–5. The guided first delivery: the door rule, the route map, the round result.
  await page.evaluate(() => localStorage.clear());
  await page.goto('https://vanful.test/');
  const shots: Record<string, string> = { packing: 'screen-3-door-rule', route: 'screen-4-route', result: 'screen-5-delivered' };
  await playTutorial(page, async (m) => {
    if (!shots[m]) return;
    await page.waitForTimeout(m === 'result' ? 1500 : 400);
    await canvasShot(page, shots[m]);
  });
  // 2. A real shift's first load: the full parcel tray.
  await page.waitForTimeout(1200);
  await canvasShot(page, 'screen-2-shift');
});

for (const [name, w, h] of [['portrait', 1080, 1620], ['landscape', 1920, 1080]] as const) {
  test(`video frames ${name}`, async ({ browser }) => {
    const dir = `${RAW}/${name}`;
    mkdirSync(dir, { recursive: true });
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    await serve(page);
    await page.goto('https://vanful.test/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('https://vanful.test/');
    const cdp = await page.context().newCDPSession(page);
    const frames: { file: string; t: number }[] = [];
    cdp.on('Page.screencastFrame', async (f) => {
      const file = `${dir}/${String(frames.length).padStart(5, '0')}.jpg`;
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      frames.push({ file, t: f.metadata.timestamp ?? Date.now() / 1000 });
      await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    // Start once the game is on screen: the front door's Play button is not gameplay.
    const start = page.getByRole('button', { name: 'Play free' });
    await start.click();
    await expect.poll(() => scenes(page), { timeout: 20_000 }).toContain('Game');
    await page.waitForTimeout(600);
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: w, maxHeight: h, everyNthFrame: 1 });
    await playTutorial(page, async (m) => { if (m === 'result') await page.waitForTimeout(2500); }).catch(() => {});
    // Then the real shift: full tray, clock running.
    await page.waitForTimeout(4000);
    await cdp.send('Page.stopScreencast');
    writeFileSync(`${dir}/frames.json`, JSON.stringify(frames));
  });
}
