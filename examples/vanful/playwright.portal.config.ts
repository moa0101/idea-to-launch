import { defineConfig, devices } from '@playwright/test';

// Plays the upload-ready portal builds (dist-portal/, from `npm run build:portals`) as a portal would serve them:
// from a sub-folder on the portal's own host. No server and no real database: requests are intercepted.
export default defineConfig({
  testDir: 'e2e',
  testMatch: 'portal.spec.ts',
  timeout: 60_000,
  use: { channel: 'chrome', headless: true },
  projects: [
    { name: 'desktop-landscape', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
