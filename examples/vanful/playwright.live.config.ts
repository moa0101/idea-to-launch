import { defineConfig, devices } from '@playwright/test';

// Smoke-test the deployed site: `npx playwright test -c playwright.live.config.ts`
// Only tests that need no test-only build flags run here.
export default defineConfig({
  testDir: 'e2e',
  testMatch: 'live.spec.ts', // intercepts Supabase: never writes to the real playtest DB
  timeout: 60_000,
  use: { baseURL: process.env.LIVE_URL || 'https://vanful.vercel.app', channel: 'chrome', headless: true },
  projects: [
    { name: 'live-desktop', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'live-mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
