import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Determine environment (default to 'dev')
const ENV = process.env.ENV || 'dev';

// Import environment-specific config
const envConfig = require(`./config/${ENV}.config`).default;

export default defineConfig({
  testDir: './tests',
  
  // Timeout settings
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 2 : undefined, // Limit workers in CI
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Console output
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  // Shared settings for all projects
  use: {
    baseURL: envConfig.baseURL,
    
    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Tracing and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Network settings
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  // Project definitions for different test types
  projects: [
    // Setup project - runs first to prepare auth states
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },

    // Chromium - Desktop
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-auth.json', // Default auth state
      },
      dependencies: ['setup'],
    },

    // Firefox - Desktop
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth/user-auth.json',
      },
      dependencies: ['setup'],
    },

    // WebKit - Desktop
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'auth/user-auth.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'auth/user-auth.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        storageState: 'auth/user-auth.json',
      },
      dependencies: ['setup'],
    },

    // API Testing project (no browser needed)
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: envConfig.apiURL,
      },
    },

    // Tagged test projects
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      grep: /@smoke/,
      dependencies: ['setup'],
    },

    {
      name: 'regression',
      use: { ...devices['Desktop Chrome'] },
      grep: /@regression/,
      grepInvert: /@smoke/, // Exclude smoke tests
      dependencies: ['setup'],
    },

    {
      name: 'critical',
      use: { ...devices['Desktop Chrome'] },
      grep: /@critical/,
      dependencies: ['setup'],
    },

    {
      name: 'ai-generated',
      use: { ...devices['Desktop Chrome'] },
      grep: /@ai-generated/,
      dependencies: ['setup'],
    },
  ],
});
