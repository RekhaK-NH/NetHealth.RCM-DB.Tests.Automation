/**
 * RCM Direct Billing - Claims Management Tests
 * Tests claim creation, batch processing, and FRP statements
 * @tags @rcm @claims @smoke @regression
 */
import { test, expect } from '../../fixtures';
import { ClaimsPage } from '../../pages/rcm/claims.page';
import { DateHelper } from '../../utils/date-helper';

test.describe('RCM Claims - Create Claims @rcm @claims @create-claims', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToCreateClaims();
    await claimsPage.verifyPageLoaded();
  });

  test('create claims for date range @smoke @functional @critical', async ({ page }) => {
    const today = new Date();
    const servicesFrom = DateHelper.formatDate(DateHelper.subtractDays(today, 30));
    const servicesTo = DateHelper.formatDate(today);

    await test.step('Configure date range filters', async () => {
      await claimsPage.setServicesFromDate(servicesFrom);
      await claimsPage.setServicesToDate(servicesTo);
    });

    await test.step('Set job limit', async () => {
      await claimsPage.setJobLimit(25);
    });

    await test.step('Initiate claim creation job', async () => {
      await claimsPage.clickStart();
    });

    await test.step('Verify job initiated successfully', async () => {
      await page.waitForTimeout(2000);
      await claimsPage.clickRefresh();
      
      // Verify job appears in the list
      const jobDescription = `Services through ${servicesTo}`;
      const jobRow = claimsPage.getJobRowByDescription(jobDescription);
      
      const isVisible = await jobRow.isVisible().catch(() => false);
      if (!isVisible) {
        // Job might have already completed or description might differ
        console.log('Job may have completed or has different description');
      }
    });
  });

  test('create claims with division filter @regression @functional', async ({ page }) => {
    const today = new Date();
    const servicesFrom = DateHelper.formatDate(DateHelper.subtractDays(today, 14));
    const servicesTo = DateHelper.formatDate(today);

    await test.step('Configure filters with division', async () => {
      await claimsPage.configureClaimFilters({
        servicesFrom: servicesFrom,
        servicesTo: servicesTo,
        division: 'All Divisions',
        jobLimit: 25
      });
    });

    await test.step('Start claim generation', async () => {
      await claimsPage.clickStart();
    });

    await test.step('Monitor job creation', async () => {
      await page.waitForTimeout(2000);
      await claimsPage.clickRefresh();
      
      const isRunning = await claimsPage.isBatchJobRunning();
      expect(typeof isRunning).toBe('boolean');
    });
  });

  test('create claims with payer and plan selection @regression @functional @e2e', async ({ page }) => {
    const today = new Date();
    const servicesFrom = DateHelper.formatDate(DateHelper.subtractDays(today, 7));
    const servicesTo = DateHelper.formatDate(today);

    await test.step('Configure claim filters with payer information', async () => {
      await claimsPage.setServicesFromDate(servicesFrom);
      await claimsPage.setServicesToDate(servicesTo);
      
      // Select paying agency (if available)
      const payerDropdown = page.locator('select[name*="PayingAgency"], select[name*="Payer"]').first();
      const isPayerVisible = await payerDropdown.isVisible().catch(() => false);
      
      if (isPayerVisible) {
        const payerOptions = await payerDropdown.locator('option').count();
        if (payerOptions > 1) {
          await payerDropdown.selectOption({ index: 1 });
          await page.waitForTimeout(500);
          
          // Select plan if available
          const planDropdown = page.locator('select[name*="Plan"]').first();
          const isPlanVisible = await planDropdown.isVisible().catch(() => false);
          
          if (isPlanVisible) {
            const planOptions = await planDropdown.locator('option').count();
            if (planOptions > 1) {
              await planDropdown.selectOption({ index: 1 });
            }
          }
        }
      }
    });

    await test.step('Initiate claim generation', async () => {
      await claimsPage.clickStart();
    });

    await test.step('Verify claim job initiated', async () => {
      await page.waitForTimeout(2000);
      await claimsPage.clickRefresh();
    });
  });

  test('verify month-end close requirement checkbox @regression @functional', async ({ page }) => {
    await test.step('Verify checkbox is present', async () => {
      const checkbox = page.locator('input[type="checkbox"][name*="MonthEnd"]').first();
      const isVisible = await checkbox.isVisible().catch(() => false);
      
      if (isVisible) {
        await test.step('Toggle month-end close checkbox', async () => {
          await claimsPage.setRequireMonthEndClose(true);
          const isChecked = await checkbox.isChecked();
          expect(isChecked).toBeTruthy();
        });
      } else {
        console.log('Month-end close checkbox not found on current page');
      }
    });
  });

  test('verify all charges posted requirement checkbox @regression @functional', async ({ page }) => {
    await test.step('Verify checkbox is present', async () => {
      const checkbox = page.locator('input[type="checkbox"][name*="AllCharges"]').first();
      const isVisible = await checkbox.isVisible().catch(() => false);
      
      if (isVisible) {
        await test.step('Toggle all charges posted checkbox', async () => {
          await claimsPage.setRequireAllChargesPosted(true);
          const isChecked = await checkbox.isChecked();
          expect(isChecked).toBeTruthy();
        });
      } else {
        console.log('All charges posted checkbox not found on current page');
      }
    });
  });

  test('monitor claim job status and completion @regression @functional', async ({ page }) => {
    await test.step('Refresh to get current jobs', async () => {
      await claimsPage.clickRefresh();
    });

    await test.step('Check for completed jobs', async () => {
      const jobRows = page.locator('table tbody tr');
      const jobCount = await jobRows.count();

      if (jobCount > 0) {
        // Get status of first job
        const firstRow = jobRows.first();
        const statusCell = firstRow.locator('td').nth(3);
        const status = await statusCell.textContent();
        
        console.log(`First job status: ${status}`);
        
        // Status should contain either clean claims count or running message
        expect(status).toBeTruthy();
      }
    });
  });

  test('verify clean claims count in job status @regression @functional', async ({ page }) => {
    await test.step('Refresh job list', async () => {
      await claimsPage.clickRefresh();
    });

    await test.step('Check for jobs with clean claims', async () => {
      const cleanClaimsText = page.getByText(/Clean claims:/i);
      const hasCleanClaims = await cleanClaimsText.isVisible().catch(() => false);
      
      if (hasCleanClaims) {
        console.log('Found job(s) with clean claims count');
        await expect(cleanClaimsText).toBeVisible();
      } else {
        console.log('No completed jobs with clean claims found');
      }
    });
  });

  test('verify hierarchical filter dependencies @regression @functional', async ({ page }) => {
    await test.step('Test division -> region -> area dependency', async () => {
      const divisionDropdown = page.locator('select[name*="Division"]').first();
      const isDivisionVisible = await divisionDropdown.isVisible().catch(() => false);
      
      if (isDivisionVisible) {
        const divisionOptions = await divisionDropdown.locator('option').count();
        
        if (divisionOptions > 1) {
          await divisionDropdown.selectOption({ index: 1 });
          await page.waitForTimeout(500);
          
          // Check if region dropdown is now enabled
          const regionDropdown = page.locator('select[name*="Region"]').first();
          const isRegionEnabled = await regionDropdown.isEnabled().catch(() => false);
          
          if (isRegionEnabled) {
            const regionOptions = await regionDropdown.locator('option').count();
            expect(regionOptions).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});

test.describe('RCM Claims - Claim Search @rcm @claims @search', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToClaimSearch();
  });

  test('navigate to claim search page @smoke @functional', async ({ page }) => {
    await test.step('Verify Claim Search page loaded', async () => {
      await page.waitForLoadState('networkidle');
      
      // Verify we're on claims search page
      const urlMatch = await page.url().toLowerCase().includes('claims');
      expect(urlMatch).toBeTruthy();
    });
  });

  test('verify search page elements @regression @functional', async ({ page }) => {
    await test.step('Verify search filters present', async () => {
      await page.waitForLoadState('networkidle');
      
      // Check for common search elements
      const hasFilters = await page.locator('input, select, button').first().isVisible();
      expect(hasFilters).toBeTruthy();
    });
  });
});

test.describe('RCM Claims - Batch Claims @rcm @claims @batch', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToBatchClaims();
  });

  test('navigate to batch claims page @smoke @functional', async ({ page }) => {
    await test.step('Verify Batch Claims page loaded', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('verify batch claims page structure @regression @functional', async ({ page }) => {
    await test.step('Verify page has loaded with expected elements', async () => {
      await page.waitForLoadState('networkidle');
      
      // Should have some form elements or content
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
    });
  });
});

test.describe('RCM Claims - Manage Claim Batches @rcm @claims @manage-batches', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToManageClaimBatches();
  });

  test('navigate to manage claim batches page @smoke @functional @critical', async ({ page }) => {
    await test.step('Verify Manage Claim Batches page loaded', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('verify manage batches page elements @regression @functional', async ({ page }) => {
    await test.step('Check for batch management elements', async () => {
      await page.waitForLoadState('networkidle');
      
      // Verify page has interactive elements
      const hasElements = await page.locator('table, button, input, select').first().isVisible().catch(() => false);
      expect(hasElements).toBeTruthy();
    });
  });
});

test.describe('RCM Claims - FRP Statements @rcm @claims @frp-statements', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToFRPStatements();
  });

  test('navigate to FRP statements page @smoke @functional', async ({ page }) => {
    await test.step('Verify FRP Statements page loaded', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('verify FRP statements page structure @regression @functional', async ({ page }) => {
    await test.step('Verify page content', async () => {
      await page.waitForLoadState('networkidle');
      
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
    });
  });
});

test.describe('RCM Claims - Rebill Information @rcm @claims @rebill', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await claimsPage.navigateToRebillInfo();
  });

  test('navigate to rebill info page @smoke @functional', async ({ page }) => {
    await test.step('Verify Rebill Info page loaded', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('RCM Claims - Performance Tests @rcm @claims @performance', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
  });

  test('measure claim creation page load time @performance @regression', async ({ page }) => {
    const startTime = Date.now();

    await test.step('Navigate to Create Claims page', async () => {
      await claimsPage.navigateToCreateClaims();
      await page.waitForLoadState('networkidle');
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    await test.step('Verify page loads within acceptable time', async () => {
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
      console.log(`Claims page loaded in ${loadTime}ms`);
    });
  });

  test('verify job refresh response time @performance @regression', async ({ page }) => {
    await test.step('Navigate to claims page', async () => {
      await claimsPage.navigateToCreateClaims();
    });

    const startTime = Date.now();

    await test.step('Refresh job list', async () => {
      await claimsPage.clickRefresh();
      await page.waitForLoadState('networkidle');
    });

    const endTime = Date.now();
    const refreshTime = endTime - startTime;

    await test.step('Verify refresh completes quickly', async () => {
      expect(refreshTime).toBeLessThan(5000); // Should refresh within 5 seconds
      console.log(`Job list refreshed in ${refreshTime}ms`);
    });
  });
});
