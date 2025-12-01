import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  authenticatedPage: Page;
  loginAsAdmin: Page;
  loginAsUser: Page;
};

export const test = base.extend<AuthFixtures>({
  // Default authenticated page (uses saved auth state)
  authenticatedPage: async ({ page }, use) => {
    // Page already has auth state from playwright.config.ts
    await page.goto('/dashboard');
    await use(page);
  },

  // Login as admin on-demand (without using saved state)
  loginAsAdmin: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    
    const ENV = process.env.ENV || 'dev';
    const envConfig = require(`../config/${ENV}.config`).default;
    
    await loginPage.login(
      envConfig.users.admin.username,
      envConfig.users.admin.password
    );
    
    await use(page);
    await context.close();
  },

  // Login as default user on-demand (without using saved state)
  loginAsUser: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    
    const ENV = process.env.ENV || 'dev';
    const envConfig = require(`../config/${ENV}.config`).default;
    
    await loginPage.login(
      envConfig.users.defaultUser.username,
      envConfig.users.defaultUser.password
    );
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
