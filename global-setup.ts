import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.ENV || 'dev';
const envConfig = require(`./config/${ENV}.config`).default;

async function globalSetup(config: FullConfig) {
  console.log(`🚀 Starting global setup for ${envConfig.name} environment...`);

  // Ensure auth directory exists
  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Setup authentication states for different user types
  await setupAuth('user', envConfig.users.defaultUser);

  console.log('✅ Global setup completed successfully!');
}

async function setupAuth(userType: string, credentials: { username: string; password: string }) {
  const authFile = path.join(__dirname, 'auth', `${userType}-auth.json`);

  console.log(`🔐 Setting up ${userType} authentication...`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page - use loginURL if available, otherwise baseURL
    const loginUrl = envConfig.loginURL || envConfig.baseURL;
    await page.goto(loginUrl);
    await page.waitForLoadState('domcontentloaded');

    // Perform login with RCM-specific selectors
    const usernameField = page.locator('#UserName, input[name="UserName"], input[id="username"], input[type="text"]').first();
    const passwordField = page.locator('#Password, input[name="Password"], input[id="password"], input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), input[value="Login"], button:has-text("Sign In")').first();
    
    await usernameField.waitFor({ state: 'visible', timeout: 10000 });
    await usernameField.fill(credentials.username);
    await passwordField.fill(credentials.password);
    await loginButton.click();

    // Wait for successful login - RCM Direct Billing redirects to Financials or main page
    await page.waitForTimeout(3000); // Give time for redirect
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(async () => {
      // If networkidle doesn't work, check for common post-login elements
      await page.locator('a:has-text("Patients"), a:has-text("Revenue"), a:has-text("Claims"), a[href*="Logout"]').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    });

    // Save authentication state
    await context.storageState({ path: authFile });
    console.log(`✅ ${userType} auth state saved to ${authFile}`);

  } catch (error) {
    console.error(`❌ Failed to setup ${userType} authentication:`, error);
    // Log current URL for debugging
    console.log(`Current URL: ${page.url()}`);
    // Take screenshot for debugging
    const screenshotPath = path.join(__dirname, 'auth', `${userType}-login-error.png`);
    await page.screenshot({ path: screenshotPath }).catch(() => {});
    console.log(`Screenshot saved to: ${screenshotPath}`);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
