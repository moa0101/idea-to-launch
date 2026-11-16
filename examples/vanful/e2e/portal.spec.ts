import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { playTutorial } from './helpers';

const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };

for (const [ch, origin] of [['itch', 'https://html-classic.itch.zone'], ['crazygames', 'https://games.crazygames.com'], ['poki', 'https://games.poki.com']] as const) {
  test(`${ch} build plays from a sub-folder and tags events with the channel`, async ({ page }) => {
    const dir = `dist-portal/${ch}`;
    test.skip(!existsSync(dir), 'run npm run build:portals first');
    const base = `${origin}/html/1234567/`;
    const missing: string[] = [];
    await page.route(`${origin}/**`, (route) => {
      const url = new URL(route.request().url());
      if (!url.pathname.startsWith('/html/1234567/')) { missing.push(url.pathname); return route.fulfill({ status: 404 }); }
      const rel = url.pathname.slice('/html/1234567/'.length) || 'index.html';
      const file = join(dir, rel);
      if (!existsSync(file)) { missing.push(rel); return route.fulfill({ status: 404 }); }
      return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' });
    });
    const rows: { event: string; props: Record<string, unknown> }[] = [];
    await page.route('**/rest/v1/**', async (route) => {
      const body = route.request().postDataJSON();
      if (route.request().url().endsWith('/play_events')) rows.push(...body);
      await route.fulfill({ status: 201 });
    });

    await page.goto(base + 'index.html?ref=hn');
    await playTutorial(page);
    await page.evaluate(() => dispatchEvent(new Event('pagehide')));
    await expect.poll(() => rows.map((r) => r.event)).toContain('tutorial_done');
    expect(missing).toEqual([]);
    expect(new Set(rows.map((r) => r.props.ch))).toEqual(new Set([ch]));
    expect(rows.every((r) => r.props.ref === 'hn')).toBe(true);
  });
}
