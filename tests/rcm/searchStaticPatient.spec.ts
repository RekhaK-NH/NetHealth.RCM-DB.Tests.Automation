import { test, expect } from '@playwright/test';

test('Search Static Patient and read Account No', async ({ page }) => {
  await page.goto('https://baseint.therapy.nethealth.com/Login');

  await expect(page.locator('#container')).toContainText('RCM Direct Bill');
  await expect(page.locator('#container')).toContainText('v26.01.01.17');

  await page.locator('#userName').click();
  await page.locator('#userName').fill('Rekhak');

  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Password1');

  await expect(page.getByRole('button')).toContainText('SIGN IN');
  await page.getByRole('button', { name: 'SIGN IN' }).click();

  // Wait for navigation after sign in
  await page.waitForLoadState('networkidle');
  await page.waitForURL(/.*Financials.*/);

  // Navigate to patient search
  await page.goto('https://baseint.therapy.nethealth.com/Financials#patient/search', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('#main-header')).toContainText('Patients');
  await expect(page.locator('#applicationHost')).toContainText('Search');
  //await page.getByRole('link', { name: 'Reconcile Patients' }).click();
  //await page.getByRole('button', { name: 'Import:' }).click();

  // Click on Search link
  await page.getByRole('link', { name: 'Search' }).click();
  await page.waitForTimeout(1000); // Wait for UI to update

  await page.getByRole('link', { name: '-- Select an Entity --' }).click();
  await page.getByRole('option', { name: 'Auto DB ALF Clinic01' }).click();

  await page.waitForTimeout(500); // Wait for entity selection to complete

  // Enter last name in the first textbox (Last Name field)
  await page.getByRole('textbox').nth(0).click();
  await page.getByRole('textbox').nth(0).fill('K');

  // Select "First Name" from the search type combobox dropdown
  await page.getByRole('combobox').nth(1).selectOption('firstName');

  // Wait for the second textbox to be enabled
  await page.getByRole('textbox').nth(1).waitFor({ state: 'attached' });

  // Enter the first name in the second textbox (First Name field)
  await page.getByRole('textbox').nth(1).fill('Rzora');

  await page.getByRole('button', { name: 'Search' }).click();

  // Read and store the text from the gridcell
  const accountNo = await page.getByRole('gridcell', { name: '11356' }).textContent();
  console.log('Account No:', accountNo);
});
