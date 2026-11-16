import { defineConfig, devices } from '@playwright/test';

// End-to-end tests drive the real production build with real mouse/keyboard input.
export default defineConfig({
  testDir: 'e2e',
  // live.spec runs against the real site (playwright.live.config.ts); portal.spec against the zips (playwright.portal.config.ts).
  testIgnore: ['live.spec.ts', 'portal.spec.ts'],
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4174', channel: 'chrome', headless: true, permissions: ['clipboard-read', 'clipboard-write'] },
  webServer: {
    // Test build: VITE_E2E enables ?shift=<seconds>; a fake waitlist endpoint shows the email form (requests are intercepted).
    command: 'VITE_E2E=1 VITE_SUPABASE_URL=https://waitlist.test VITE_SUPABASE_ANON_KEY=test-anon-key npm run build && npx vite preview --port 4174 --strictPort',
    url: 'http://localhost:4174',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
