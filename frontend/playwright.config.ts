import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4029',
    locale: 'ar-EG',
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    launchOptions: process.env.PLAYWRIGHT_EDGE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EDGE_PATH }
      : {},
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run serve -- -p 4029',
    url: 'http://localhost:4029',
    timeout: 120000,
    reuseExistingServer: false,
  },
});
