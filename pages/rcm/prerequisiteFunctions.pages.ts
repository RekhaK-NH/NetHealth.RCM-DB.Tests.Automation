import { Page, expect } from '@playwright/test';
import { DateHelper } from '../../utils/date-helper';

// Base URL for the application
const BASE_URL = 'https://baseint.therapy.nethealth.com';

/**
 * Login to the RCM application
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto(`${BASE_URL}/Login`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('#container')).toContainText('RCM Direct Bill');
  await page.locator('#userName').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'SIGN IN' }).click();

  // Use a more robust approach for waiting after login
  try {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  } catch (error) {
    console.log('Network idle timeout, proceeding with URL wait...');
  }

  await page.waitForURL(/.*Financials.*/, { timeout: 20000 });
}

/**
 * Navigate to Reconcile Patients screen and import unique patient
 * Checks if patient is available on reconcile page before importing
 * @param page - Playwright Page object
 * @param uniquePatientLastName - Last name of the unique patient to create (e.g., 'Playwright')
 * @returns Promise<boolean> - true if patient was imported or not needed, false if patient not found
 */
export async function navigateAndImportUniquePatient(
  page: Page,
  uniquePatientLastName: string
): Promise<boolean> {
  // Navigate to Reconcile Patients screen
  await page.goto(`${BASE_URL}/Financials#patient/import`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Reconcile Patients' }).click();
  await page.waitForTimeout(1500);
  console.log('📋 Navigated to Reconcile Patients screen');

  // Check if patient is available on reconcile page
  const patientAvailable = await checkPatientAvailableOnReconcile(page, uniquePatientLastName);

  if (!patientAvailable) {
    console.log(`ℹ️  Patient '${uniquePatientLastName}' not found on Reconcile Patients page`);
    console.log(`⏭️  Skipping import process - will proceed directly to patient search`);
    return true; // Return true to continue with the test flow
  }

  // Import unique patient if available
  return await importUniquePatientFromReconcile(page, uniquePatientLastName);
}

/**
 * Navigate to patient search page
 */
export async function navigateToPatientSearch(page: Page) {
  // First, navigate to the Patients module from main navigation
  console.log('Clicking Patients link in main navigation...');
  await page.getByRole('link', { name: ' Patients' }).first().click();
  await page.waitForTimeout(2000);

  // Wait for the patient navigation to load, then click Search
  console.log('Looking for Search link...');

  // Try multiple approaches to find and click the Search link
  const searchSelectors = [
    'a[href="#patient/search"]',
    'link:has-text("Search")',
    'a:has-text("Search")',
  ];

  let searchClicked = false;
  for (const selector of searchSelectors) {
    try {
      const searchLink = page.locator(selector);
      if (await searchLink.isVisible({ timeout: 5000 })) {
        console.log(`Found Search link with selector: ${selector}`);
        await searchLink.click();
        searchClicked = true;
        console.log('✅ Clicked Search link');
        await page.waitForTimeout(1000);
        break;
      }
    } catch (e) {
      console.log(`Search link not found with selector: ${selector}`);
    }
  }

  if (!searchClicked) {
    // Fallback: navigate directly to patient search URL
    console.log('Fallback: Navigating directly to patient search URL...');
    await page.goto(`${BASE_URL}/Financials#patient/search`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);
  }

  console.log('✅ Successfully navigated to Patient Search');
}

/**
 * Search for a patient by entity, last name, and first name
 */
export async function searchPatient(
  page: Page,
  entity: string,
  lastName: string,
  firstName: string
) {
  await page.getByRole('link', { name: '-- Select an Entity --' }).click();
  await page.getByRole('option', { name: entity, exact: true }).click();
  await page.waitForTimeout(500);

  // Enter last name
  await page.getByRole('textbox').nth(0).fill(lastName);

  // Select First Name criteria
  await page.getByRole('combobox').nth(1).selectOption('firstName');
  await page.getByRole('textbox').nth(1).waitFor({ state: 'attached' });

  // Enter first name
  await page.getByRole('textbox').nth(1).fill(firstName);
  await page.getByRole('button', { name: 'Search' }).click();
}

/**
 * Navigate to Revenue and configure post charges
 * Deletes old Post Charge jobs for the logged-in user before creating new ones
 * Validates if charges are already posted for the patient before running the job
 * @param page - Playwright Page object
 * @param entity - Entity name
 * @param monthOffset - Month offset from current month (0 = current, -1 = previous month, etc.)
 * @param username - Username to filter jobs for deletion (optional)
 * @param patientAccountNo - Patient account number to check for existing charges (optional)
 */
export async function postCharges(
  page: Page,
  entity: string,
  monthOffset: number = 0,
  username?: string,
  patientAccountNo?: string
) {
  await page.getByRole('link', { name: ' Revenue' }).click();
  await expect(page.locator('#applicationHost')).toContainText('Post Charges');

  // Delete old Post Charge jobs for the logged-in user
  await deleteOldPostChargeJobs(page, username);

  // Get start date (first date of the month)
  const startDate = DateHelper.getFirstDateOfMonthWithOffset(monthOffset);
  console.log(`📅 Start Date: ${startDate}`);

  // Get end date (last date of the month)
  const endDate = DateHelper.getLastDateOfMonthWithOffset(monthOffset);
  console.log(`📅 End Date: ${endDate}`);

  // Set start date
  await page.getByRole('textbox', { name: 'mm/dd/yyyy' }).first().fill(startDate);

  // Set end date using direct input instead of calendar
  await page.getByRole('textbox', { name: 'mm/dd/yyyy' }).nth(1).fill(endDate);

  // Select entity
  await page.getByRole('link', { name: '-- Select an Entity --' }).click();
  await page.getByLabel('', { exact: true }).fill(entity);
  await page.getByText(entity, { exact: true }).click();

  // Start the job (deletion already happened above)
  console.log('🚀 Starting post charge job...');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForTimeout(2000);

  // Check for duplicate job error popup and handle it
  const errorPopup = page.locator('text="Error Starting Job"');
  const duplicateErrorMessage = page.locator(':has-text("Duplicate job already scheduled")');

  if (
    (await errorPopup.isVisible({ timeout: 3000 })) ||
    (await duplicateErrorMessage.isVisible({ timeout: 3000 }))
  ) {
    console.log('❌ Duplicate job error still detected - performing additional cleanup...');

    // Close the error popup
    const closeButton = page.locator(
      'button:has-text("Close"), button:has-text("OK"), button:has-text("×")'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }

    // Perform more aggressive cleanup
    await forceDeleteAllPostChargeJobs(page, username);
    await page.waitForTimeout(2000);

    // Try starting the job one more time
    console.log('🔄 Retrying job creation after aggressive cleanup...');
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(2000);
  }

  console.log('✅ Post charge job started successfully');

  // Wait for post charge job to start
  console.log('📝 Post charge job started - waiting for completion...');
  await page.waitForTimeout(3000);

  // Wait for job completion by checking for View/Delete/Export icons
  await waitForPostChargeJobCompletion(page);
}

/**
 * Force delete all post charge jobs for a user (more aggressive cleanup)
 * @param page - Playwright Page object
 * @param username - Username to filter jobs for deletion
 */
async function forceDeleteAllPostChargeJobs(page: Page, username?: string) {
  try {
    console.log(`🗑️ Force deleting ALL post charge jobs for user: ${username || 'ALL'}...`);

    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`🔄 Deletion attempt ${attempt}/${maxAttempts}`);

      // Refresh the page to get latest job list
      const refreshButton = page.getByRole('button', { name: 'Refresh' });
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }

      // Get all job rows
      const jobRows = await page.locator('table tbody tr').all();

      if (jobRows.length === 0) {
        console.log('ℹ️ No jobs found in table');
        break;
      }

      let deletedAny = false;

      for (let i = 0; i < jobRows.length; i++) {
        const row = jobRows[i];
        const rowText = await row.textContent();

        // Skip if not a post charge job - look for both patterns
        if (
          !rowText ||
          (!rowText.includes('Services from') && !rowText.includes('Services through'))
        ) {
          continue;
        }

        // If username specified, check if job belongs to user
        if (username) {
          try {
            const requestedByCell = row.locator('td').nth(1);
            const requestedBy = await requestedByCell.textContent({ timeout: 3000 });
            if (!requestedBy?.includes(username)) {
              console.log(`⏭️ Skipping job not requested by ${username}: ${requestedBy}`);
              continue;
            }
          } catch (error) {
            console.log(`⚠️ Could not read requested by for row ${i + 1}`);
            continue;
          }
        }

        console.log(`🎯 Found job to delete: ${rowText.substring(0, 80)}...`);

        // Try to delete - look for delete button/icon
        const deleteButton = row
          .locator('td')
          .last()
          .locator(
            'button[title*="Delete"], a[title*="Delete"], .fa-trash, .delete-action, [class*="delete"]'
          );

        if (await deleteButton.first().isVisible({ timeout: 2000 })) {
          try {
            await deleteButton.first().click();
            console.log(`🗑️ Clicked delete for job`);
            await page.waitForTimeout(500);

            // Handle confirmation dialogs
            const confirmButton = page.locator(
              'button:has-text("Yes"), button:has-text("OK"), button:has-text("Confirm"), button:has-text("Delete")'
            );
            if (await confirmButton.first().isVisible({ timeout: 3000 })) {
              await confirmButton.first().click();
              console.log('✅ Confirmed deletion');
              await page.waitForTimeout(1000);
              deletedAny = true;
              break; // Break and refresh to get updated table
            }
          } catch (deleteError) {
            console.log(`⚠️ Could not delete job: ${deleteError}`);
          }
        } else {
          console.log('⚠️ Delete button not found for this job');
        }
      }

      if (!deletedAny) {
        console.log('ℹ️ No more jobs to delete found');
        break;
      }

      await page.waitForTimeout(1000);
    }

    console.log('✅ Force deletion process completed');
  } catch (error) {
    console.error('❌ Error in force delete:', error);
  }
}

/**
 * Wait for post charge job to complete by refreshing and checking for completion icons
 * @param page - Playwright Page object
 */
async function waitForPostChargeJobCompletion(page: Page) {
  const maxAttempts = 20; // Maximum number of refresh attempts
  let attempts = 0;

  console.log('⏳ Waiting for post charge job to complete...');

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔄 Checking job completion (attempt ${attempts}/${maxAttempts})`);

    // Click Refresh button to update job status
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }

    // Alternative: Toggle between Quick Claims and Post Charges to refresh
    await page.getByRole('link', { name: 'Quick Claims' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Post Charges' }).click();
    await page.waitForTimeout(2000);

    // Check if View/Delete/Export icons are present (indicating job completion)
    const viewIcon = page.locator('[title*="View"], [title*="view"], .fa-eye, .view-icon');
    const deleteIcon = page.locator(
      '[title*="Delete"], [title*="delete"], .fa-trash, .delete-icon'
    );
    const exportIcon = page.locator(
      '[title*="Export"], [title*="export"], .fa-download, .export-icon'
    );

    // Check if any of the completion icons are visible
    const iconsVisible = await Promise.all([
      viewIcon
        .first()
        .isVisible()
        .catch(() => false),
      deleteIcon
        .first()
        .isVisible()
        .catch(() => false),
      exportIcon
        .first()
        .isVisible()
        .catch(() => false),
    ]);

    if (iconsVisible.some(visible => visible)) {
      console.log('✅ Post charge job completed - View/Delete/Export icons are now visible');
      return;
    }

    // Check if job status shows "Completed" or "Charges to post: X"
    const jobStatusElement = page.locator('table tbody tr').first();
    if (await jobStatusElement.isVisible()) {
      const statusText = await jobStatusElement.textContent();
      if (
        statusText &&
        (statusText.includes('Charges to post:') || statusText.includes('Completed'))
      ) {
        console.log('✅ Post charge job completed - status shows completion');
        return;
      }
    }

    console.log('⏳ Job still in progress, waiting...');
    await page.waitForTimeout(5000); // Wait 5 seconds before next check
  }

  console.warn('⚠️ Maximum attempts reached - proceeding anyway (job may still be processing)');
}

/**
 * Check if charges are already posted for a patient in the specified month
 * @param page - Playwright Page object
 * @param patientAccountNo - Patient account number
 * @param monthOffset - Month offset to check charges for
 * @returns Promise<boolean> - true if charges exist for the exact service date range, false otherwise
 */
export async function checkExistingCharges(
  page: Page,
  patientAccountNo: string,
  specificDate: string = '9/1/2025'
): Promise<{ hasCharges: boolean; chargeControlNumbers: string[] }> {
  try {
    console.log(`🔍 Checking existing charges for patient account: ${patientAccountNo}`);
    console.log(`📅 Looking for charges posted on specific date: ${specificDate}`);

    // Click the '.' icon to open patient ledger from the search results
    console.log('🖱️  Clicking "." icon to open patient ledger...');
    await page.getByTitle('View detail.').first().click();
    await page.waitForTimeout(2000);

    // Set the date range to filter charges - use the specific date for both from and to
    const servicesFromInput = page.locator('input[placeholder="mm/dd/yyyy"]').first();
    const servicesToInput = page.locator('input[placeholder="mm/dd/yyyy"]').nth(1);

    if (await servicesFromInput.isVisible()) {
      await servicesFromInput.clear();
      await servicesFromInput.fill(specificDate);
      await servicesToInput.clear();
      await servicesToInput.fill(specificDate);
      await page.getByRole('button', { name: 'View' }).click();
      await page.waitForTimeout(2000);
    }

    // Check for charge entries with the specific date
    const chargeRows = await page.locator('table tbody tr:has-text("Charge")').all();
    const chargeControlNumbers: string[] = [];

    if (chargeRows.length === 0) {
      console.log(`ℹ️  No charges found for date ${specificDate}`);
      return { hasCharges: false, chargeControlNumbers: [] };
    }

    // Check if charges exist for the specific date
    let chargesFound = false;

    for (const row of chargeRows) {
      const serviceDatesCell = row.locator('td').nth(6); // Assuming Service Dates column
      const serviceDates = await serviceDatesCell.textContent();

      // Extract Charge Control Number (assuming it's in a specific column)
      const chargeControlCell = row.locator('td').nth(1); // Adjust column index as needed
      const chargeControlNumber = await chargeControlCell.textContent();

      if (serviceDates && serviceDates.includes(specificDate)) {
        chargesFound = true;

        if (chargeControlNumber && chargeControlNumber.trim()) {
          chargeControlNumbers.push(chargeControlNumber.trim());
          console.log(`📋 Found existing Charge Control Number: ${chargeControlNumber.trim()}`);
        }

        const rowText = await row.textContent();
        console.log(`✅ Found charge for date ${specificDate}: ${rowText?.substring(0, 100)}...`);
      }
    }

    if (chargesFound) {
      console.log(
        `❌ Found ${chargeControlNumbers.length} existing charge(s) for date ${specificDate}`
      );
      console.log(`📋 Charge Control Numbers: ${chargeControlNumbers.join(', ')}`);
      return { hasCharges: true, chargeControlNumbers };
    } else {
      console.log(`ℹ️  No charges found for date ${specificDate}`);
      return { hasCharges: false, chargeControlNumbers: [] };
    }
  } catch (error) {
    console.error('❌ Exception in checkExistingCharges:', error);
    return { hasCharges: false, chargeControlNumbers: [] };
  }
}

/**
 * Delete old Post Charge jobs for the specified user
 * @param page - Playwright Page object
 * @param username - Username to filter jobs (if not provided, deletes all visible jobs)
 */
export async function deleteOldPostChargeJobs(page: Page, username?: string) {
  try {
    console.log('🗑️  Deleting ALL old Post Charge jobs for user...');

    if (!username) {
      console.log('⚠️  No username provided - skipping job deletion');
      return;
    }

    // First refresh to get the latest job list
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }

    let deletedCount = 0;
    let maxAttempts = 20; // Prevent infinite loop
    let attempts = 0;

    // Keep checking and deleting until no more jobs for the user are found
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Deletion attempt ${attempts}/${maxAttempts}`);

      // Get current job list (refresh each time as table changes after deletion)
      const jobRows = await page.locator('table tbody tr').all();

      if (jobRows.length === 0) {
        console.log('ℹ️  No jobs found in table');
        break;
      }

      let foundJobToDelete = false;

      // Iterate through each row to find jobs by the specific user
      for (let i = 0; i < jobRows.length; i++) {
        const row = jobRows[i];
        const rowText = await row.textContent();

        // Skip if not a post charge job
        if (
          !rowText ||
          (!rowText.includes('Services through') && !rowText.includes('Services from'))
        ) {
          continue;
        }

        // Check if job belongs to the specified user (2nd column is "Requested By")
        const requestedByCell = row.locator('td').nth(1);
        const requestedBy = await requestedByCell.textContent();

        if (requestedBy && requestedBy.includes(username)) {
          console.log(`🎯 Found job to delete: ${rowText.substring(0, 60)}...`);

          // Try multiple delete button selectors
          const deleteSelectors = [
            'button[title*="Delete"]',
            'a[title*="Delete"]',
            '.fa-trash',
            'button:has(.fa-trash)',
            '[title*="delete"]',
          ];

          let deleted = false;

          for (const selector of deleteSelectors) {
            const deleteButton = row.locator(selector);

            if (await deleteButton.isVisible()) {
              try {
                await deleteButton.click();
                await page.waitForTimeout(1000);

                // Handle confirmation dialog
                const confirmSelectors = [
                  'button:has-text("Yes")',
                  'button:has-text("OK")',
                  'button:has-text("Confirm")',
                  'button:has-text("Delete")',
                  'button[type="submit"]',
                ];

                for (const confirmSelector of confirmSelectors) {
                  const confirmButton = page.locator(confirmSelector);
                  if (await confirmButton.isVisible({ timeout: 3000 })) {
                    await confirmButton.click();
                    await page.waitForTimeout(1000);
                    break;
                  }
                }

                console.log(`✅ Deleted job: ${rowText.substring(0, 50)}...`);
                deletedCount++;
                foundJobToDelete = true;
                deleted = true;
                break;
              } catch (deleteError) {
                console.log(`⚠️ Error deleting job: ${deleteError}`);
              }
            }
          }

          if (deleted) {
            // Break out of the row loop and start fresh since table has changed
            break;
          } else {
            console.log(`⚠️ Could not find delete button for job: ${rowText.substring(0, 50)}...`);
          }
        }
      }

      // If no job was found to delete in this iteration, we're done
      if (!foundJobToDelete) {
        console.log('✅ No more jobs found for deletion');
        break;
      }

      // Refresh the page to get updated job list after deletion
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }
    }

    if (deletedCount > 0) {
      console.log(
        `✅ Successfully deleted ${deletedCount} old Post Charge jobs for user: ${username}`
      );
    } else {
      console.log(`ℹ️  No Post Charge jobs found for user: ${username}`);
    }
  } catch (error) {
    console.error('❌ Error deleting old Post Charge jobs:', error);
  }
}

/**
 * Delete old Claim Generation jobs for the specified user
 * @param page - Playwright Page object
 * @param username - Username to filter jobs (if not provided, deletes all visible jobs)
 */
/**
 * Force delete ALL claim generation jobs for a specific user with comprehensive retry logic
 * Similar to forceDeleteAllPostChargeJobs but for claim generation jobs
 * @param page - Playwright Page object
 * @param username - Username to target for deletion (e.g., 'RekhaK')
 * @returns Promise<void>
 */
export async function forceDeleteAllClaimJobs(page: Page, username: string): Promise<void> {
  try {
    console.log(`🗑️ Force deleting ALL claim generation jobs for user: ${username}...`);

    // Navigate to Claims Generation page
    await page.goto(`${BASE_URL}/Financials#claims/generation`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(2000);

    const maxAttempts = 10;
    let attempt = 1;
    let deletedCount = 0;

    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh"), .fa-refresh').first();

    while (attempt <= maxAttempts) {
      console.log(`🔄 Deletion attempt ${attempt}/${maxAttempts}`);

      // Get all job rows from the table
      const jobRows = await page.locator('table tbody tr').all();

      if (jobRows.length === 0) {
        console.log('ℹ️  No jobs found in table');
        break;
      }

      let foundJobToDelete = false;

      // Iterate through each row to find jobs by the specific user
      for (let i = 0; i < jobRows.length; i++) {
        const row = jobRows[i];
        const rowText = await row.textContent();

        // Skip if not a claim generation job
        if (
          !rowText ||
          (!rowText.includes('Services through') &&
            !rowText.includes('Create Claims') &&
            !rowText.includes('Generated Claim batch'))
        ) {
          continue;
        }

        // Check if job belongs to the specified user (2nd column is "Requested By")
        const requestedByCell = row.locator('td').nth(1);
        const requestedBy = await requestedByCell.textContent();

        if (requestedBy && requestedBy.includes(username)) {
          console.log(`🎯 Found job to delete: ${rowText.substring(0, 60)}...`);

          // Try multiple delete button selectors
          const deleteSelectors = [
            'button[title*="Delete"]',
            'a[title*="Delete"]',
            '.fa-trash',
            'button:has(.fa-trash)',
            '[title*="delete"]',
          ];

          let deleted = false;

          for (const selector of deleteSelectors) {
            const deleteButton = row.locator(selector);

            if (await deleteButton.isVisible()) {
              try {
                await deleteButton.click();
                console.log('🗑️ Clicked delete for job');
                await page.waitForTimeout(1000);

                // Handle confirmation dialog
                const confirmSelectors = [
                  'button:has-text("Yes")',
                  'button:has-text("OK")',
                  'button:has-text("Confirm")',
                  'button:has-text("Delete")',
                  'button[type="submit"]',
                ];

                for (const confirmSelector of confirmSelectors) {
                  const confirmButton = page.locator(confirmSelector);
                  if (await confirmButton.isVisible({ timeout: 3000 })) {
                    await confirmButton.click();
                    console.log('✅ Confirmed deletion');
                    await page.waitForTimeout(1000);
                    break;
                  }
                }

                deletedCount++;
                foundJobToDelete = true;
                deleted = true;
                break;
              } catch (deleteError) {
                console.log(`⚠️ Error deleting job: ${deleteError}`);
              }
            }
          }

          if (deleted) {
            // Break out of the row loop and start fresh since table has changed
            break;
          } else {
            console.log(`⚠️ Could not find delete button for job`);
          }
        } else {
          console.log(`⏭️ Skipping job not requested by ${username}: ${requestedBy}`);
        }
      }

      // If no job was found to delete in this iteration, we're done
      if (!foundJobToDelete) {
        console.log('ℹ️ No more jobs to delete found');
        break;
      }

      // Refresh the page to get updated job list after deletion
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }

      attempt++;
    }

    if (deletedCount > 0) {
      console.log(
        `✅ Successfully deleted ${deletedCount} claim generation jobs for user: ${username}`
      );
    } else {
      console.log(`ℹ️ No claim generation jobs found for user: ${username}`);
    }

    console.log('✅ Force deletion process completed');
  } catch (error) {
    console.error('❌ Error in forceDeleteAllClaimJobs:', error);
    // Continue with the test even if deletion fails
  }
}

/**
 * Wait for claim generation job to complete by checking for View/Delete/Export icons
 * @param page - Playwright Page object
 * @param username - Username to monitor jobs for
 * @param maxWaitTimeMs - Maximum time to wait in milliseconds (default: 300000ms = 5 minutes)
 * @returns Promise<boolean> - true if job completed, false if timed out
 */
export async function waitForClaimJobCompletion(
  page: Page,
  username: string,
  maxWaitTimeMs: number = 300000
): Promise<boolean> {
  console.log('📝 Claim generation job started - waiting for completion...');
  const startTime = Date.now();
  const maxAttempts = 20;

  while (Date.now() - startTime < maxWaitTimeMs) {
    const attempt = Math.floor((Date.now() - startTime) / 15000) + 1;
    console.log(
      `⏳ Waiting for claim job to complete... 🔄 Checking job completion (attempt ${attempt}/${maxAttempts})`
    );

    try {
      // Check for View, Delete, or Export icons which indicate job completion
      const completionIndicators = [
        'button[title*="View"], a[title*="View"]',
        'button[title*="Delete"], a[title*="Delete"]',
        'button[title*="Export"], a[title*="Export"]',
        '.fa-eye',
        '.fa-trash',
        '.fa-download',
      ];

      let jobCompleted = false;

      for (const indicator of completionIndicators) {
        const indicatorElement = page.locator(indicator);
        if (await indicatorElement.isVisible({ timeout: 2000 })) {
          // Check if this indicator is for a job by the specified user
          const parentRow = indicatorElement.locator('xpath=ancestor::tr');
          const requestedByCell = parentRow.locator('td').nth(1);
          const requestedBy = await requestedByCell.textContent();

          if (requestedBy && requestedBy.includes(username)) {
            console.log(
              '✅ Claim generation job completed - View/Delete/Export icons are now visible'
            );
            jobCompleted = true;
            break;
          }
        }
      }

      if (jobCompleted) {
        return true;
      }

      // Wait before next check
      await page.waitForTimeout(15000); // Wait 15 seconds between checks
    } catch (error) {
      console.log(`⚠️ Error checking job completion: ${error}`);
      await page.waitForTimeout(10000);
    }
  }

  console.log('⏰ Timeout waiting for claim job completion');
  return false;
}

/**
 * Click View Details icon for the most recent claim job for the logged-in user
 * @param page - Playwright Page object
 * @param username - Username to target for View Details click
 * @returns Promise<boolean> - true if clicked successfully, false otherwise
 */
export async function clickViewDetailsForRecentClaimJob(
  page: Page,
  username: string
): Promise<boolean> {
  try {
    console.log(`🔍 Looking for View Details icon for most recent job by user: ${username}`);

    // Navigate to Claims Generation page if not already there
    await page.goto(`${BASE_URL}/Financials#claims/generation`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(2000);

    // Get all job rows from the table
    const jobRows = await page.locator('table tbody tr').all();

    if (jobRows.length === 0) {
      console.log('ℹ️ No jobs found in table');
      return false;
    }

    // Look for the first (most recent) job by the specified user
    for (let i = 0; i < jobRows.length; i++) {
      const row = jobRows[i];
      const rowText = await row.textContent();

      // Skip if not a claim generation job
      if (
        !rowText ||
        (!rowText.includes('Services through') &&
          !rowText.includes('Create Claims') &&
          !rowText.includes('Generated Claim batch'))
      ) {
        continue;
      }

      // Check if job belongs to the specified user
      const requestedByCell = row.locator('td').nth(1);
      const requestedBy = await requestedByCell.textContent();

      if (requestedBy && requestedBy.includes(username)) {
        console.log(`🎯 Found recent job by ${username}: ${rowText.substring(0, 60)}...`);

        // Look for View Details button/icon in this row
        const viewDetailSelectors = [
          'button[title*="View"]',
          'a[title*="View"]',
          '.fa-eye',
          'button:has(.fa-eye)',
          '[title*="View detail"]',
        ];

        for (const selector of viewDetailSelectors) {
          const viewButton = row.locator(selector);

          if (await viewButton.isVisible()) {
            await viewButton.click();
            console.log('✅ Clicked View Details for recent claim job');
            await page.waitForTimeout(2000);
            return true;
          }
        }

        console.log('⚠️ View Details button not found for this job');
        return false;
      }
    }

    console.log(`❌ No recent claim jobs found for user: ${username}`);
    return false;
  } catch (error) {
    console.error('❌ Error clicking View Details for recent claim job:', error);
    return false;
  }
}

export async function deleteOldClaimJobs(page: Page, username?: string) {
  try {
    console.log('🗑️  Checking for old Claim Generation jobs to delete...');

    if (username) {
      // Use the comprehensive force deletion for specific user
      await forceDeleteAllClaimJobs(page, username);
    } else {
      // Keep the original simple deletion logic for backward compatibility
      await page.goto(`${BASE_URL}/Financials#claims/generation`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(1000);

      const jobRows = await page.locator('table tbody tr').all();

      if (jobRows.length === 0) {
        console.log('ℹ️  No existing claim generation jobs found');
        return;
      }

      let deletedCount = 0;

      for (const row of jobRows) {
        const rowText = await row.textContent();
        if (!rowText?.includes('Services through') && !rowText?.includes('Create Claims')) {
          continue;
        }

        const deleteButton = row
          .locator('td')
          .last()
          .locator('button[title*="Delete"], a[title*="Delete"]');

        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          console.log(`🗑️  Deleted claim job: ${rowText.substring(0, 50)}...`);
          deletedCount++;
          await page.waitForTimeout(500);

          const confirmButton = page.locator(
            'button:has-text("Yes"), button:has-text("OK"), button:has-text("Confirm")'
          );
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
            await page.waitForTimeout(300);
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Deleted ${deletedCount} old Claim Generation job(s)`);
        await page.waitForTimeout(1000);
      } else {
        console.log('ℹ️  No claim generation jobs needed deletion');
      }
    }
  } catch (error) {
    console.error('⚠️  Error deleting old claim jobs:', error);
  }
}

/**
 * Review and post charges for a specific patient
 * Unselects all patients first, then selects only the required patient(s)
 * @param page - Playwright Page object
 * @param patientName - Name of the patient to select
 * @returns Promise<string> - Total amount to post
 */
export async function reviewAndPostCharges(page: Page, patientName: string): Promise<string> {
  await page.getByRole('link', { name: 'Post Charges' }).click();
  await page.getByTitle('View').first().click();

  // Use Patient Name filter to filter by specific patient
  console.log(`🔍 Filtering by Patient Name: ${patientName}`);

  // Find the Patient Name dropdown/filter at the top of the page
  const patientNameFilter = page
    .locator(
      'select:near(:text("Patient Name")), input:near(:text("Patient Name")), [placeholder*="Select a patient"]'
    )
    .first();

  if (await patientNameFilter.isVisible({ timeout: 5000 })) {
    await patientNameFilter.click();
    await page.waitForTimeout(500);

    // Type the patient name to filter
    await patientNameFilter.fill(patientName);
    await page.waitForTimeout(1000);

    // Click search button to apply filter
    await page.getByRole('button', { name: 'Search' }).click();
    console.log(`✅ Applied patient filter for: ${patientName}`);
    await page.waitForTimeout(2000);
  }

  // Unselect all patients first
  console.log('🔄 Unselecting all patients...');
  const allCheckboxes = await page.locator('table tbody tr td input[type="checkbox"]').all();
  for (const checkbox of allCheckboxes) {
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
      console.log('⬜ Unchecked a patient');
    }
  }
  await page.waitForTimeout(500);

  // Select patient from filtered results
  console.log(`🎯 Selecting filtered patient: ${patientName}`);

  // After filtering, the table should only show matching patients
  // Find and check the checkbox for the specific patient
  const patientRow = page.locator(`table tbody tr:has-text("${patientName}")`).first();

  if (await patientRow.isVisible({ timeout: 5000 })) {
    const patientCheckbox = patientRow.locator('input[type="checkbox"]').first();
    await patientCheckbox.check();
    console.log(`✅ Selected patient: ${patientName}`);
  } else {
    // If exact match not found, select first checkbox in filtered results
    const firstCheckbox = page.locator('table tbody tr td input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible({ timeout: 3000 })) {
      await firstCheckbox.check();
      console.log(`✅ Selected first filtered patient`);
    }
  }

  // Review charge details - click View detail for the selected patient
  console.log('📋 Reviewing charge details...');

  // Find the checked patient row and click its View detail button
  const checkedRow = page.locator('table tbody tr:has(input[type="checkbox"]:checked)').first();
  if (await checkedRow.isVisible({ timeout: 5000 })) {
    const viewDetailButton = checkedRow.getByTitle('View detail.');
    await viewDetailButton.click();
    console.log('✅ Clicked View detail for selected patient');
  } else {
    // Fallback: click the first View detail button
    await page.getByTitle('View detail.').first().click();
    console.log('✅ Clicked first View detail button');
  }

  await page.getByTitle('Return to List').first().click();

  // Get total amount to post
  const totalAmountElement = page
    .locator('text=Total Amount to Post:')
    .locator('..')
    .locator('text=/\\$[\\d,]+\\.\\d{2}/');
  const totalAmount = (await totalAmountElement.textContent()) || '$0.00';
  console.log(`💰 Total Amount to Post: ${totalAmount}`);

  // Post charges
  await page.getByText('I have reviewed the charges').click();
  await page.getByRole('button', { name: 'Post Charges' }).click();

  return totalAmount;
}
/**
 * Create a claim for a specific patient
 * Deletes old claim generation jobs for the logged-in user before creating new ones
 * Unselects all patients first, then selects only the required patient
 * @param page - Playwright Page object
 * @param servicesThrough - Services through date (not currently used, kept for compatibility)
 * @param patientName - Name of the patient to create claim for
 * @param username - Username to filter jobs for deletion (optional)
 * @returns Promise<object> - Claim statistics including number of claims, amounts, and errors
 */
export async function createClaim(
  page: Page,
  servicesThrough: string,
  patientName: string,
  username?: string
): Promise<{
  numberOfClaims: string;
  amountOfClaims: string;
  numberOfErrors: string;
  amountOfErrorClaims: string;
}> {
  await page.getByRole('link', { name: 'Claims' }).click();
  await page.getByRole('button', { name: 'Create Claims' }).click();

  // Delete old claim generation jobs for the logged-in user
  const userToDelete = username || 'RekhaK'; // Default to RekhaK if no username provided
  await deleteOldClaimJobs(page, userToDelete);

  // Set services through date with multiple selector attempts
  console.log('📅 Setting services through date...');
  const calendarSelectors = [
    '#date-selector-content button[title*="Calendar"]',
    '#date-selector-content .fa-calendar',
    '#date-selector-content button:has(.fa-calendar)',
    '.input-group-addon button',
    'button[title="Open calendar"]',
    '#date-selector-content button',
  ];

  let calendarClicked = false;
  for (const selector of calendarSelectors) {
    try {
      const calendarButton = page.locator(selector).first();
      if (await calendarButton.isVisible({ timeout: 5000 })) {
        await calendarButton.click();
        console.log(`✅ Clicked calendar using selector: ${selector}`);
        calendarClicked = true;
        break;
      }
    } catch (error) {
      console.log(`⚠️ Calendar selector failed: ${selector}`);
    }
  }

  if (!calendarClicked) {
    console.log('⚠️ Could not find calendar button, trying alternative approach...');
    // Try clicking on the date input field instead
    const dateInput = page.locator('#date-selector-content input[type="text"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.click();
      console.log('✅ Clicked date input field as fallback');
    }
  }

  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: 'November' }).click();
  await page.getByText('Sep').click();
  await page.getByRole('cell', { name: '30' }).click();

  await page.getByRole('button', { name: 'Ok' }).click();
  await page.getByRole('link', { name: ' Claims' }).click();

  // Wait for claim creation job to complete
  console.log('⏳ Waiting for claim generation job to complete...');
  await waitForClaimJobCompletion(page, userToDelete);

  // Click View Details on the most recent job
  await clickViewDetailsForRecentClaimJob(page, userToDelete);
  await page.waitForTimeout(2000);

  // Navigate to Batch Claims
  await page.getByRole('link', { name: 'Batch Claims' }).click();
  await page.getByRole('link', { name: 'Create Claims' }).click();

  // Unselect all patients first
  console.log('🔄 Unselecting all patients...');
  await page.waitForTimeout(1000);
  const allCheckboxes = await page.locator('table tbody tr td input[type="checkbox"]').all();
  for (const checkbox of allCheckboxes) {
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
      console.log('⬜ Unchecked a patient');
    }
  }
  await page.waitForTimeout(500);

  // Search and select specific patient
  console.log(`🔍 Searching for patient: ${patientName}`);
  await page.getByTitle('View').first().click();
  await page.getByRole('link', { name: '- Select a patient -' }).click();

  // Wait for search input to be visible and use a more robust selector
  const searchInput = page.locator('[id*="autogen"][id*="search"]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.fill(patientName);

  await page.getByRole('option', { name: patientName }).click();
  await page.getByRole('button', { name: 'Search' }).click();

  // Wait for search results and select the patient
  await page.waitForTimeout(1000);

  // Find and check the checkbox for the specific patient
  const patientRow = page.locator(`table tbody tr:has-text("${patientName}")`).first();
  const patientCheckbox = patientRow.locator('input[type="checkbox"]').first();
  await patientCheckbox.check();
  console.log(`✅ Selected patient: ${patientName}`);

  // Create claims
  await page.getByRole('button', { name: 'Create Claims' }).click();
  await page.waitForTimeout(2000);

  // Read claim statistics
  const numberOfClaimsElement = page
    .locator('text=Number of Claims:')
    .locator('..')
    .locator('text=/\\d+/');
  const numberOfClaims = (await numberOfClaimsElement.textContent()) || '0';
  console.log(`📊 Number of Claims: ${numberOfClaims}`);

  const amountOfClaimsElement = page
    .locator('text=Amount of Claims:')
    .locator('..')
    .locator('text=/\\$[\\d,]+\\.\\d{2}/');
  const amountOfClaims = (await amountOfClaimsElement.textContent()) || '$0.00';
  console.log(`💰 Amount of Claims: ${amountOfClaims}`);

  const numberOfErrorsElement = page
    .locator('text=Number of Errors:')
    .locator('..')
    .locator('text=/\\d+/');
  const numberOfErrors = (await numberOfErrorsElement.textContent()) || '0';
  console.log(`⚠️  Number of Errors: ${numberOfErrors}`);

  const amountOfErrorClaimsElement = page
    .locator('text=Amount of Error Claims:')
    .locator('..')
    .locator('text=/\\$[\\d,]+\\.\\d{2}/');
  const amountOfErrorClaims = (await amountOfErrorClaimsElement.textContent()) || '$0.00';
  console.log(`❌ Amount of Error Claims: ${amountOfErrorClaims}`);

  return {
    numberOfClaims,
    amountOfClaims,
    numberOfErrors,
    amountOfErrorClaims,
  };
}

/**
 * Verify claim created and return claim number
 */
export async function verifyClaimCreated(page: Page) {
  await page.getByRole('link', { name: ' Patients' }).click();
  await page.getByTitle('View detail.').first().click();

  // Get claim number
  const claimCell = page.getByRole('gridcell', { name: /^\d+$/ }).first();
  const claimNumber = await claimCell.textContent();
  console.log('Claim Number:', claimNumber);

  return claimNumber;
}

/**
 * Select item from multiple dropdowns with the same class
 */
export async function selectItemFromMultipleDropdown(page: Page, value: string): Promise<boolean> {
  try {
    const selector = 'select.form-control.recon-action';
    const dropdowns = await page.locator(selector).all();

    for (const dropdown of dropdowns) {
      await dropdown.click();
      await dropdown.selectOption({ label: value });
    }

    return true;
  } catch (error) {
    console.error('Exception in selectItemFromMultipleDropdown:', error);
    return false;
  }
}

/**
 * Select item from dynamic reconcile table by patient name
 */
export async function selectItemFromDynamicReconcileTable(
  page: Page,
  name: string,
  dropdownValue: string
): Promise<boolean> {
  try {
    // Scroll to top
    await page.evaluate('window.scrollTo(0, 0)');

    // Get all table cells in second column
    const cells = await page.locator('table td:nth-child(2)').all();

    for (let i = 0; i < cells.length; i++) {
      const cellText = await cells[i].textContent();

      if (cellText && cellText.includes(name)) {
        // Click dropdown in the 8th column (2nd column + 6 siblings = 8th column)
        const dropdownSelector = `table td:nth-child(2):nth-of-type(${
          i + 1
        }) ~ td:nth-child(8) select`;
        await page.locator(dropdownSelector).click();
        await page.waitForTimeout(1000);

        // Select option by text
        await page.locator(dropdownSelector).selectOption({ label: dropdownValue });
        return true;
      }
    }

    console.error(`Patient name "${name}" not found in table`);
    return false;
  } catch (error) {
    console.error('Exception in selectItemFromDynamicReconcileTable:', error);
    return false;
  }
}

/**
 * Select unique patient from Reconcile Patients screen by creating new patient
 * @param page - Playwright Page object
 * @param lastName - Patient's last name to match (e.g., 'AUZMurray')
 * @param action - Action to select ('Hold', 'Merge', 'Create New')
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function selectPatientFromReconcileScreen(
  page: Page,
  lastName: string,
  action: 'Hold' | 'Merge' | 'Create New'
): Promise<boolean> {
  try {
    // Wait for reconcile table to load
    await expect(page.locator('table')).toBeVisible();
    await page.waitForTimeout(1000);

    // Find all rows with matching last name
    const lastNameCells = await page.locator('table tbody tr td:nth-child(2)').all();

    for (let i = 0; i < lastNameCells.length; i++) {
      const cellText = await lastNameCells[i].textContent();

      if (cellText && cellText.trim() === lastName) {
        // Found matching patient - now select action from dropdown
        const row = lastNameCells[i].locator('xpath=ancestor::tr');
        const actionDropdown = row.locator('td:last-child select, td:last-child combobox');

        await actionDropdown.click();
        await page.waitForTimeout(500);

        // Select the action
        await actionDropdown.selectOption({ label: action });

        console.log(`Selected "${action}" for patient: ${lastName}`);
        return true;
      }
    }

    console.error(`Patient "${lastName}" not found in reconcile table`);
    return false;
  } catch (error) {
    console.error('Exception in selectPatientFromReconcileScreen:', error);
    return false;
  }
}

/**
 * Process multiple patients in Reconcile screen and click Import
 * @param page - Playwright Page object
 * @param patientActions - Array of objects with lastName and action
 * @example
 * await processReconcilePatientsAndImport(page, [
 *   { lastName: 'AUZMurray', action: 'Create New' },
 *   { lastName: 'HMBraun', action: 'Hold' }
 * ]);
 */
export async function processReconcilePatientsAndImport(
  page: Page,
  patientActions: Array<{ lastName: string; action: 'Hold' | 'Merge' | 'Create New' }>
): Promise<boolean> {
  try {
    // Process each patient
    for (const patient of patientActions) {
      const success = await selectPatientFromReconcileScreen(
        page,
        patient.lastName,
        patient.action
      );
      if (!success) {
        console.error(`Failed to process patient: ${patient.lastName}`);
        return false;
      }
      await page.waitForTimeout(500);
    }

    // Click Import button
    await page.getByRole('button', { name: 'Import' }).click();
    console.log('Clicked Import button - processing reconciliation...');

    // Wait for import to complete
    await page.waitForTimeout(2000);

    return true;
  } catch (error) {
    console.error('Exception in processReconcilePatientsAndImport:', error);
    return false;
  }
}

/**
 * Import unique patient as "Create New" and set all others to "Hold" from Reconcile Patients screen
 * @param page - Playwright Page object
 * @param uniquePatientLastName - Last name of the unique patient to create (e.g., 'AUZMurray')
 * @returns Promise<boolean> - true if successful, false otherwise
 * @example
 * // This will create new patient for 'AUZMurray' and hold all other patients
 * await importUniquePatientFromReconcile(page, 'AUZMurray');
 */
export async function importUniquePatientFromReconcile(
  page: Page,
  uniquePatientLastName: string
): Promise<boolean> {
  try {
    console.log('🔍 Processing Reconcile Patients screen...');

    // Check for "no patients to reconcile" popup first
    const popupHandled = await handlePatientReconciliationPopup(page);
    if (popupHandled) {
      console.log('ℹ️  Patient already imported - skipping reconciliation');
      return true;
    }

    // Wait for reconcile table to load
    await expect(page.locator('table')).toBeVisible();
    await page.waitForTimeout(1000);

    // Get all rows in the reconcile table
    const rows = await page.locator('table tbody tr').all();
    console.log(`Found ${rows.length} patients in reconcile table`);

    let uniquePatientFound = false;

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Get the last name from the second column
      const lastNameCell = row.locator('td:nth-child(2)');
      const lastName = await lastNameCell.textContent();

      if (!lastName) continue;

      const trimmedLastName = lastName.trim();

      // Get the action dropdown in the last column
      const actionDropdown = row.locator('td:last-child select');

      // Wait for dropdown to be visible
      await actionDropdown.waitFor({ state: 'visible', timeout: 10000 });

      // Check if this is the unique patient
      if (trimmedLastName === uniquePatientLastName) {
        // Select "Create New" for the unique patient
        await actionDropdown.selectOption({ label: 'Create New' });
        console.log(`✅ Selected "Create New" for unique patient: ${trimmedLastName}`);
        uniquePatientFound = true;
      } else {
        // Select "Hold" for all other patients
        await actionDropdown.selectOption({ label: 'Hold' });
        console.log(`⏸️  Selected "Hold" for patient: ${trimmedLastName}`);
      }

      await page.waitForTimeout(200);
    }

    if (!uniquePatientFound) {
      console.error(`❌ Unique patient "${uniquePatientLastName}" not found in reconcile table`);
      return false;
    }

    // Click Import button
    console.log('📤 Clicking Import button...');
    await page.getByRole('button', { name: 'Import' }).click();
    await page.waitForTimeout(2000);

    console.log('✅ Successfully imported unique patient and held others');
    return true;
  } catch (error) {
    console.error('❌ Exception in importUniquePatientFromReconcile:', error);
    return false;
  }
}

/**
 * Check if a patient is available on the Reconcile Patients page
 * @param page - Playwright Page object
 * @param uniquePatientLastName - Last name of the patient to look for
 * @returns Promise<boolean> - true if patient is found, false if not found
 */
export async function checkPatientAvailableOnReconcile(
  page: Page,
  uniquePatientLastName: string
): Promise<boolean> {
  try {
    console.log(
      `🔍 Checking if patient '${uniquePatientLastName}' is available on Reconcile Patients page...`
    );

    // First check for "no patients to reconcile" popup
    const popupHandled = await handlePatientReconciliationPopup(page);
    if (popupHandled) {
      console.log('ℹ️  No patients to reconcile popup appeared');
      return false;
    }

    // Wait for reconcile table to load
    await page.waitForTimeout(1000);

    // Check if table exists
    const tableExists = await page.locator('table').isVisible();
    if (!tableExists) {
      console.log('ℹ️  No reconcile table found - no patients available');
      return false;
    }

    // Get all rows in the reconcile table
    const rows = await page.locator('table tbody tr').all();

    if (rows.length === 0) {
      console.log('ℹ️  No patients found in reconcile table');
      return false;
    }

    console.log(`📊 Found ${rows.length} patient(s) in reconcile table`);

    // Search for the specific patient
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Get the last name from the second column with timeout
        const lastNameCell = row.locator('td:nth-child(2)');
        const lastName = await lastNameCell.textContent({ timeout: 5000 });

        if (!lastName) continue;

        const trimmedLastName = lastName.trim();

        if (trimmedLastName === uniquePatientLastName) {
          console.log(`✅ Patient '${uniquePatientLastName}' found on Reconcile Patients page`);
          return true;
        }
      } catch (error) {
        console.log(`⚠️  Could not read patient name from row ${i + 1}, skipping...`);
        continue;
      }
    }

    console.log(`❌ Patient '${uniquePatientLastName}' not found on Reconcile Patients page`);
    console.log('📝 Available patients:');

    // Log available patients for debugging
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i];
      const lastNameCell = row.locator('td:nth-child(2)');
      const lastName = await lastNameCell.textContent();
      if (lastName) {
        console.log(`   - ${lastName.trim()}`);
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Exception in checkPatientAvailableOnReconcile:', error);
    return false;
  }
}

/**
 * Handle Patient Reconciliation popup that appears when no new patients to reconcile
 * @param page - Playwright Page object
 * @returns Promise<boolean> - true if popup appeared and was handled, false if no popup
 */
export async function handlePatientReconciliationPopup(page: Page): Promise<boolean> {
  try {
    // Wait briefly for popup to appear
    const popup = page.locator('text=Patient Reconciliation');
    const isVisible = await popup.isVisible({ timeout: 3000 });

    if (isVisible) {
      console.log('⚠️  Patient Reconciliation popup detected - no new patients to reconcile');

      // Check for the message
      const message = await page
        .locator('text=There are no new patients to reconcile at this time')
        .isVisible();
      if (message) {
        console.log('ℹ️  Message: There are no new patients to reconcile at this time');
      }

      // Click Close button
      await page.getByRole('button', { name: 'Close' }).click();
      console.log('✅ Closed Patient Reconciliation popup');

      return true;
    }

    return false;
  } catch (error) {
    // No popup found - this is expected behavior when there are patients to reconcile
    return false;
  }
}

/**
 * Navigate to Reconcile Patients screen
 * @param page - Playwright Page object
 */
export async function navigateToReconcilePatients(page: Page) {
  await page.goto(`${BASE_URL}/Financials#patient/import`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Reconcile Patients' }).click();
  await page.waitForTimeout(1500);
  console.log('📋 Navigated to Reconcile Patients screen');
}
