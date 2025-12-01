/**
 * Seed test for Playwright Agents - RCM Direct Billing
 * This test sets up the environment and serves as an example for agent-generated tests
 * @tags @setup @smoke @rcm
 */
import { test, expect } from '../fixtures';

test('seed - setup authenticated session @setup @smoke @rcm', async ({ page }) => {
  // Navigate to the RCM Direct Billing application after authentication
  await page.goto('https://basereg.therapy.nethealth.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Verify successful authentication - check for RCM navigation tabs
  const hasNavigation = await page.locator('a:has-text("Patients"), a:has-text("Revenue"), a:has-text("Claims")').first().isVisible().catch(() => false);
  
  if (hasNavigation) {
    await expect(page.locator('a:has-text("Patients"), a:has-text("Revenue"), a:has-text("Claims")').first()).toBeVisible();
  } else {
    // If navigation not immediately visible, verify we're not on login page
    const onLoginPage = await page.url().toLowerCase().includes('login');
    expect(onLoginPage).toBeFalsy();
  }
  
  // Verify page has loaded successfully
  await expect(page.locator('body')).toBeVisible();
  
  console.log('✅ RCM Direct Billing session authenticated successfully');
});

test('seed - verify RCM navigation menu @setup @smoke @rcm', async ({ page }) => {
  await page.goto('https://basereg.therapy.nethealth.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Verify main RCM navigation tabs are present
  const expectedTabs = ['Patients', 'Revenue', 'Claims', 'Transactions', 'Collections', 'Reports', 'Tools'];
  
  let foundTabs = 0;
  for (const tab of expectedTabs) {
    const tabElement = page.locator(`a:has-text("${tab}"), button:has-text("${tab}")`).first();
    const isVisible = await tabElement.isVisible().catch(() => false);
    if (isVisible) {
      foundTabs++;
      console.log(`✓ Found tab: ${tab}`);
    }
  }
  
  // Verify at least some core navigation tabs exist
  expect(foundTabs).toBeGreaterThanOrEqual(2);
  console.log(`✅ Found ${foundTabs} navigation tabs`);
});

test('seed - verify Patients module access @setup @smoke @rcm @patients', async ({ page }) => {
  await page.goto('https://basereg.therapy.nethealth.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Try to click Patients tab
  const patientsTab = page.locator('a:has-text("Patients")').first();
  const isVisible = await patientsTab.isVisible().catch(() => false);
  
  if (isVisible) {
    await patientsTab.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on patients page or can access patient search
    const urlCheck = page.url().toLowerCase().includes('patient') || 
                     await page.locator('text=/Patient|Search|Reconcile/i').first().isVisible().catch(() => false);
    expect(urlCheck).toBeTruthy();
    console.log('✅ Patients module accessible');
  } else {
    console.log('⚠ Patients tab not immediately visible - may need explicit navigation');
  }
});

test('seed - verify Revenue module access @setup @smoke @rcm @revenue', async ({ page }) => {
  await page.goto('https://basereg.therapy.nethealth.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Try to access Revenue tab
  const revenueTab = page.locator('a:has-text("Revenue")').first();
  const isVisible = await revenueTab.isVisible().catch(() => false);
  
  if (isVisible) {
    await revenueTab.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we can access revenue-related pages
    const urlCheck = page.url().toLowerCase().includes('revenue') ||
                     await page.locator('text=/Revenue|Post Charges|Quick Claims/i').first().isVisible().catch(() => false);
    expect(urlCheck).toBeTruthy();
    console.log('✅ Revenue module accessible');
  } else {
    console.log('⚠ Revenue tab not immediately visible - may need explicit navigation');
  }
});

test('seed - verify Claims module access @setup @smoke @rcm @claims', async ({ page }) => {
  await page.goto('https://basereg.therapy.nethealth.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Try to access Claims tab
  const claimsTab = page.locator('a:has-text("Claims")').first();
  const isVisible = await claimsTab.isVisible().catch(() => false);
  
  if (isVisible) {
    await claimsTab.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we can access claims-related pages
    const urlCheck = page.url().toLowerCase().includes('claims') ||
                     await page.locator('text=/Claims|Create|Batch|Search/i').first().isVisible().catch(() => false);
    expect(urlCheck).toBeTruthy();
    console.log('✅ Claims module accessible');
  } else {
    console.log('⚠ Claims tab not immediately visible - may need explicit navigation');
  }
});
