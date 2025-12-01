import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators
  private get usernameInput() {
    return this.page.locator('#UserName, input[name="UserName"], input[type="text"]').first();
  }

  private get passwordInput() {
    return this.page.locator('#Password, input[name="Password"], input[type="password"]').first();
  }

  private get loginButton() {
    return this.page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), input[value="Login"]').first();
  }

  private get errorMessage() {
    return this.page.locator('.error, .alert, .validation-summary-errors, [role="alert"]').first();
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.page.goto('https://basereg.therapy.nethealth.com/Login/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform login
   */
  async login(username: string, password: string) {
    await this.navigateToLogin();
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for navigation after login - adjust URL pattern based on actual post-login page
    await this.page.waitForURL(/.*\/(Home|Dashboard|Index|MainPage|Default)/, { timeout: 30000 }).catch(() => {
      // If URL doesn't change, wait for page load
      this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify login error message
   */
  async verifyErrorMessage(expectedMessage: string) {
    const actualMessage = await this.getTextContent(this.errorMessage);
    return actualMessage.includes(expectedMessage);
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled() {
    return await this.loginButton.isEnabled();
  }
}
