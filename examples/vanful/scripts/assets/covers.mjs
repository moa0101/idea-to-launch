// Renders the store covers from brand tokens (cover.html) at every size the portals ask for.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
const sizes = [['cover-itch-630x500', 630, 500], ['cover-portrait-800x1200', 800, 1200], ['cover-square-800x800', 800, 800], ['cover-portrait-1080x1620', 1080, 1620]];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('file://' + resolve('scripts/assets/cover.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `go-to-market/assets/${name}.png` });
  await page.close();
}
// Landscape cover = brand on the left, a real shift on the right (same box the landscape video plays in).
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + resolve('scripts/assets/cover.html') + '?shot=' + encodeURIComponent('file://' + resolve('go-to-market/assets/screen-2-shift.png')));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'go-to-market/assets/cover-landscape-1920x1080.png' });
}
await browser.close();
console.log('covers done');
