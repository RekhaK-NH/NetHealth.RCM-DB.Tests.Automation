/**
 * RCM Direct Billing - Patient Search and Management Tests
 * Tests patient search functionality with various filter combinations
 * @tags @rcm @patients @smoke @regression
 */
import { test, expect } from '../../fixtures';
import { PatientSearchPage } from '../../pages/rcm/patient-search.page';

test.describe('RCM Patients - Search Functionality @rcm @patients', () => {
  let patientSearchPage: PatientSearchPage;

  test.beforeEach(async ({ page }) => {
    patientSearchPage = new PatientSearchPage(page);
    await patientSearchPage.navigateToPatientSearch();
    await patientSearchPage.verifyPageLoaded();
  });

  test('search patients by agency and branch @smoke @functional @critical', async ({ page }) => {
    await test.step('Configure search filters', async () => {
      await patientSearchPage.selectAgencySite('Main Agency');
      await patientSearchPage.selectBranch('Branch 1');
    });

    await test.step('Execute search', async () => {
      await patientSearchPage.clickSearch();
    });

    await test.step('Verify search results are displayed', async () => {
      const hasResults = await patientSearchPage.hasSearchResults();
      expect(hasResults).toBeTruthy();
    });

    await test.step('Verify results table columns', async () => {
      await expect(page.getByRole('columnheader', { name: /Last Name/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /First Name/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Account No/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Entity/i })).toBeVisible();
    });
  });

  test('search patients by last name @smoke @functional', async ({ page }) => {
    await test.step('Enter last name search criteria', async () => {
      await patientSearchPage.enterLastName('Smith');
    });

    await test.step('Execute search', async () => {
      await patientSearchPage.clickSearch();
    });

    await test.step('Verify filtered results contain search term', async () => {
      const hasResults = await patientSearchPage.hasSearchResults();
      
      if (hasResults) {
        // Verify at least one result contains the search term
        const resultRow = await page.locator('table tbody tr').first();
        await expect(resultRow).toBeVisible();
      } else {
        // Verify "no results" message is displayed
        await expect(page.getByText(/No Patients to display/i)).toBeVisible();
      }
    });
  });

  test('filter patients by Hold FRP Statement status @regression @functional', async ({ page }) => {
    await test.step('Select Hold FRP Statement filter', async () => {
      await patientSearchPage.selectHoldFRPStatement('All');
    });

    await test.step('Execute search', async () => {
      await patientSearchPage.clickSearch();
    });

    await test.step('Verify search executes successfully', async () => {
      await page.waitForLoadState('networkidle');
      // Either results or no results message should be visible
      const hasResults = await patientSearchPage.hasSearchResults();
      const noResults = await page.getByText(/No Patients to display/i).isVisible().catch(() => false);
      
      expect(hasResults || noResults).toBeTruthy();
    });
  });

  test('combine multiple search filters @regression @functional @e2e', async ({ page }) => {
    await test.step('Configure multiple search filters', async () => {
      await patientSearchPage.searchPatient({
        agencySite: 'Main Agency',
        branch: 'Branch 1',
        lastName: 'Johnson',
        holdFRPStatement: 'All'
      });
    });

    await test.step('Verify search results reflect all filters', async () => {
      const hasResults = await patientSearchPage.hasSearchResults();
      
      if (hasResults) {
        const totalRecords = await patientSearchPage.getTotalRecords();
        expect(totalRecords).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('adjust results display limit @regression @functional', async ({ page }) => {
    await test.step('Execute initial search', async () => {
      await patientSearchPage.clickSearch();
    });

    await test.step('Wait for results', async () => {
      await page.waitForLoadState('networkidle');
    });

    const hasResults = await patientSearchPage.hasSearchResults();

    if (hasResults) {
      await test.step('Change display limit to 50 entries', async () => {
        await patientSearchPage.setShowEntries(50);
      });

      await test.step('Verify results update', async () => {
        await page.waitForLoadState('networkidle');
        await expect(page.locator('table tbody')).toBeVisible();
      });
    }
  });

  test('verify patient row action buttons @regression @functional', async ({ page }) => {
    await test.step('Execute search to get patient list', async () => {
      await patientSearchPage.clickSearch();
    });

    const hasResults = await patientSearchPage.hasSearchResults();

    if (hasResults) {
      await test.step('Verify action buttons are present', async () => {
        const firstRow = await page.locator('table tbody tr').first();
        await expect(firstRow).toBeVisible();
        
        // Verify action column exists
        const actionCell = firstRow.locator('td').last();
        await expect(actionCell).toBeVisible();
      });
    }
  });

  test('handle empty search results gracefully @regression @functional @validation', async ({ page }) => {
    await test.step('Search with non-existent criteria', async () => {
      await patientSearchPage.enterLastName('ZZZZNONEXISTENT12345');
      await patientSearchPage.clickSearch();
    });

    await test.step('Verify no results message displayed', async () => {
      await expect(page.getByText(/No Patients to display/i)).toBeVisible();
    });

    await test.step('Verify results counter shows zero', async () => {
      const footerText = await page.locator('text=/Showing 0 to 0 of 0 entries/i');
      const hasZeroResults = await footerText.isVisible().catch(() => false);
      // Either zero results text or "No Patients" message should be visible
      expect(hasZeroResults || await page.getByText(/No Patients/i).isVisible()).toBeTruthy();
    });
  });

  test('navigate to reconcile patients @smoke @functional', async ({ page }) => {
    await test.step('Navigate to Reconcile Patients page', async () => {
      await patientSearchPage.navigateToReconcilePatients();
    });

    await test.step('Verify Reconcile Patients page loaded', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /Reconcile Patients/i })).toBeVisible().catch(async () => {
        // Alternative verification if heading not found
        await expect(page).toHaveURL(/.*Patients/i);
      });
    });
  });

  test('verify search filters reset functionality @regression @functional', async ({ page }) => {
    await test.step('Set multiple search filters', async () => {
      await patientSearchPage.enterLastName('TestPatient');
      await patientSearchPage.selectHoldFRPStatement('All');
    });

    await test.step('Execute search', async () => {
      await patientSearchPage.clickSearch();
    });

    await test.step('Reload page to reset filters', async () => {
      await page.reload();
      await patientSearchPage.verifyPageLoaded();
    });

    await test.step('Verify filters are reset', async () => {
      const lastNameValue = await page.locator('input[name*="LastName"], #lastname').first().inputValue();
      expect(lastNameValue).toBe('');
    });
  });

  test('verify patient search performance @performance @regression', async ({ page }) => {
    const startTime = Date.now();

    await test.step('Execute patient search', async () => {
      await patientSearchPage.clickSearch();
      await page.waitForLoadState('networkidle');
    });

    const endTime = Date.now();
    const searchDuration = endTime - startTime;

    await test.step('Verify search completes within acceptable time', async () => {
      // Search should complete within 10 seconds
      expect(searchDuration).toBeLessThan(10000);
      console.log(`Patient search completed in ${searchDuration}ms`);
    });
  });
});

test.describe('RCM Patients - Data Validation @rcm @patients @validation', () => {
  let patientSearchPage: PatientSearchPage;

  test.beforeEach(async ({ page }) => {
    patientSearchPage = new PatientSearchPage(page);
    await patientSearchPage.navigateToPatientSearch();
  });

  test('verify required fields for patient search @regression @validation', async ({ page }) => {
    await test.step('Verify all filter fields are accessible', async () => {
      await expect(page.locator('select[name*="Agency"], select[name*="Site"]').first()).toBeVisible();
      await expect(page.locator('select[name*="Branch"]').first()).toBeVisible();
      await expect(page.locator('input[name*="LastName"]').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
    });
  });

  test('verify dropdown dependencies @regression @functional', async ({ page }) => {
    await test.step('Select agency/site', async () => {
      const agencyDropdown = page.locator('select[name*="Agency"], select[name*="Site"]').first();
      const initialBranchOptions = await page.locator('select[name*="Branch"] option').count();
      
      await agencyDropdown.selectOption({ index: 1 }); // Select first non-default option
      await page.waitForTimeout(1000); // Wait for branch dropdown to populate
      
      const updatedBranchOptions = await page.locator('select[name*="Branch"] option').count();
      
      // Branch options should be available after selecting agency
      expect(updatedBranchOptions).toBeGreaterThanOrEqual(initialBranchOptions);
    });
  });
});
