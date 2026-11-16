import { defineConfig } from '@playwright/test';

// Records launch assets (screenshots, video frames) from the real game. Run with `npm run assets`.
export default defineConfig({
  testDir: 'scripts/assets',
  testMatch: 'capture.spec.ts',
  timeout: 180_000,
  workers: 1,
  use: { channel: 'chrome', headless: true, deviceScaleFactor: 1 },
});
