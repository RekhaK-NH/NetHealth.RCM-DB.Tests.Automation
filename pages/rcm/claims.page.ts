import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object for RCM Direct Billing - Claims Management
 * Handles claim creation, batch management, and FRP statements
 */
export class ClaimsPage extends BasePage {
  // Navigation locators
  private get claimsTab() {
    return this.page.getByRole('link', { name: 'Claims' });
  }

  private get searchSubTab() {
    return this.page.getByRole('link', { name: 'Search' });
  }

  private get createClaimsSubTab() {
    return this.page.getByRole('link', { name: 'Create Claims' });
  }

  private get batchClaimsSubTab() {
    return this.page.getByRole('link', { name: 'Batch Claims' });
  }

  private get rebillInfoSubTab() {
    return this.page.getByRole('link', { name: 'Rebill Info' });
  }

  private get manageClaimBatchesSubTab() {
    return this.page.getByRole('link', { name: 'Manage Claim Batches' });
  }

  private get frpStatementsSubTab() {
    return this.page.getByRole('link', { name: 'FRP Statements' });
  }

  // Create Claims filter locators
  private get servicesFromDatePicker() {
    return this.page.locator('input[name*="ServicesFrom"], input[id*="from"]').first();
  }

  private get servicesToDatePicker() {
    return this.page.locator('input[name*="ServicesThrough"], input[id*="through"]').first();
  }

  private get divisionDropdown() {
    return this.page.locator('select[name*="Division"], #division').first();
  }

  private get regionDropdown() {
    return this.page.locator('select[name*="Region"], #region').first();
  }

  private get areaDropdown() {
    return this.page.locator('select[name*="Area"], #area').first();
  }

  private get entityDropdown() {
    return this.page.locator('select[name*="Entity"], #entity').first();
  }

  private get payingAgencyDropdown() {
    return this.page.locator('select[name*="PayingAgency"], select[name*="Payer"]').first();
  }

  private get planDropdown() {
    return this.page.locator('select[name*="Plan"], select[name*="PayerPlan"]').first();
  }

  private get jobLimitDropdown() {
    return this.page.locator('select[name*="JobLimit"], select[name*="Limit"]').first();
  }

  // Checkboxes
  private get requireMonthEndCloseCheckbox() {
    return this.page.locator('input[type="checkbox"][name*="MonthEnd"]').first();
  }

  private get requireAllChargesPostedCheckbox() {
    return this.page.locator('input[type="checkbox"][name*="AllCharges"]').first();
  }

  // Buttons
  private get startButton() {
    return this.page.getByRole('button', { name: /Start/i });
  }

  private get refreshButton() {
    return this.page.getByRole('button', { name: /Refresh/i });
  }

  // Results table locators
  private get resultsTable() {
    return this.page.locator('table').first();
  }

  private get descriptionColumn() {
    return this.page.getByRole('columnheader', { name: /Description/i });
  }

  private get requestedByColumn() {
    return this.page.getByRole('columnheader', { name: /Requested By/i });
  }

  private get requestedOnColumn() {
    return this.page.getByRole('columnheader', { name: /Requested On/i });
  }

  private get statusColumn() {
    return this.page.getByRole('columnheader', { name: /Status/i });
  }

  // Status messages
  private get cleanClaimsMessage() {
    return this.page.getByText(/Clean claims:/i);
  }

  private get runningInBatchJobMessage() {
    return this.page.getByText(/Running in a batch job/i);
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Claims - Search page
   */
  async navigateToClaimSearch() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.searchSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Claims - Create Claims page
   */
  async navigateToCreateClaims() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.createClaimsSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Claims - Batch Claims page
   */
  async navigateToBatchClaims() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.batchClaimsSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Claims - Manage Claim Batches page
   */
  async navigateToManageClaimBatches() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.manageClaimBatchesSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Claims - FRP Statements page
   */
  async navigateToFRPStatements() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.frpStatementsSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Claims - Rebill Info page
   */
  async navigateToRebillInfo() {
    await this.clickElement(this.claimsTab);
    await this.clickElement(this.rebillInfoSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Set Services From date
   * @param date - Date in MM/DD/YYYY format
   */
  async setServicesFromDate(date: string) {
    await this.waitForElement(this.servicesFromDatePicker);
    await this.servicesFromDatePicker.clear();
    await this.servicesFromDatePicker.fill(date);
  }

  /**
   * Set Services Through date
   * @param date - Date in MM/DD/YYYY format
   */
  async setServicesToDate(date: string) {
    await this.waitForElement(this.servicesToDatePicker);
    await this.servicesToDatePicker.clear();
    await this.servicesToDatePicker.fill(date);
  }

  /**
   * Select division from dropdown
   * @param division - The division name to select
   */
  async selectDivision(division: string) {
    await this.waitForElement(this.divisionDropdown);
    await this.divisionDropdown.selectOption({ label: division });
    await this.page.waitForTimeout(500);
  }

  /**
   * Select region from dropdown
   * @param region - The region name to select
   */
  async selectRegion(region: string) {
    await this.waitForElement(this.regionDropdown);
    await this.regionDropdown.selectOption({ label: region });
    await this.page.waitForTimeout(500);
  }

  /**
   * Select area from dropdown
   * @param area - The area name to select
   */
  async selectArea(area: string) {
    await this.waitForElement(this.areaDropdown);
    await this.areaDropdown.selectOption({ label: area });
    await this.page.waitForTimeout(500);
  }

  /**
   * Select entity from dropdown
   * @param entity - The entity name to select
   */
  async selectEntity(entity: string) {
    await this.waitForElement(this.entityDropdown);
    await this.entityDropdown.selectOption({ label: entity });
  }

  /**
   * Select paying agency from dropdown
   * @param agency - The paying agency name to select
   */
  async selectPayingAgency(agency: string) {
    await this.waitForElement(this.payingAgencyDropdown);
    await this.payingAgencyDropdown.selectOption({ label: agency });
    await this.page.waitForTimeout(500); // Wait for plan dropdown to populate
  }

  /**
   * Select plan from dropdown
   * @param plan - The plan name to select
   */
  async selectPlan(plan: string) {
    await this.waitForElement(this.planDropdown);
    await this.planDropdown.selectOption({ label: plan });
  }

  /**
   * Set job limit
   * @param limit - Job limit number (25, 50, etc.)
   */
  async setJobLimit(limit: number) {
    await this.waitForElement(this.jobLimitDropdown);
    await this.jobLimitDropdown.selectOption({ label: limit.toString() });
  }

  /**
   * Set require month-end close checkbox
   * @param checked - true to check, false to uncheck
   */
  async setRequireMonthEndClose(checked: boolean) {
    const checkbox = this.requireMonthEndCloseCheckbox;
    const isChecked = await checkbox.isChecked();
    
    if (checked !== isChecked) {
      await checkbox.check();
    }
  }

  /**
   * Set require all charges posted checkbox
   * @param checked - true to check, false to uncheck
   */
  async setRequireAllChargesPosted(checked: boolean) {
    const checkbox = this.requireAllChargesPostedCheckbox;
    const isChecked = await checkbox.isChecked();
    
    if (checked !== isChecked) {
      await checkbox.check();
    }
  }

  /**
   * Configure claim generation filters
   * @param filters - Object containing filter parameters
   */
  async configureClaimFilters(filters: {
    servicesFrom?: string;
    servicesTo?: string;
    division?: string;
    region?: string;
    area?: string;
    entity?: string;
    payingAgency?: string;
    plan?: string;
    jobLimit?: number;
    requireMonthEndClose?: boolean;
    requireAllChargesPosted?: boolean;
  }) {
    if (filters.servicesFrom) {
      await this.setServicesFromDate(filters.servicesFrom);
    }

    if (filters.servicesTo) {
      await this.setServicesToDate(filters.servicesTo);
    }

    if (filters.division) {
      await this.selectDivision(filters.division);
    }

    if (filters.region) {
      await this.selectRegion(filters.region);
    }

    if (filters.area) {
      await this.selectArea(filters.area);
    }

    if (filters.entity) {
      await this.selectEntity(filters.entity);
    }

    if (filters.payingAgency) {
      await this.selectPayingAgency(filters.payingAgency);
    }

    if (filters.plan) {
      await this.selectPlan(filters.plan);
    }

    if (filters.jobLimit) {
      await this.setJobLimit(filters.jobLimit);
    }

    if (filters.requireMonthEndClose !== undefined) {
      await this.setRequireMonthEndClose(filters.requireMonthEndClose);
    }

    if (filters.requireAllChargesPosted !== undefined) {
      await this.setRequireAllChargesPosted(filters.requireAllChargesPosted);
    }
  }

  /**
   * Click Start button to begin claim generation
   */
  async clickStart() {
    await this.clickElement(this.startButton);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click Refresh button to update job list
   */
  async clickRefresh() {
    await this.clickElement(this.refreshButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create claims with specified filters
   * @param filters - Claim filter parameters
   */
  async createClaims(filters: {
    servicesFrom: string;
    servicesTo: string;
    division?: string;
    payingAgency?: string;
    plan?: string;
  }) {
    await this.navigateToCreateClaims();
    await this.configureClaimFilters(filters);
    await this.clickStart();
  }

  /**
   * Get job row by description
   * @param description - Job description text
   * @returns Locator for the job row
   */
  getJobRowByDescription(description: string): Locator {
    return this.page.locator(`tr:has-text("${description}")`).first();
  }

  /**
   * Get job status
   * @param description - Job description to find
   * @returns Status text
   */
  async getJobStatus(description: string): Promise<string> {
    const row = this.getJobRowByDescription(description);
    const statusCell = row.locator('td').nth(3); // Status column
    return await statusCell.textContent() || '';
  }

  /**
   * Check if batch job is running
   * @returns true if job is running
   */
  async isBatchJobRunning(): Promise<boolean> {
    return await this.runningInBatchJobMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Wait for claim generation job to complete
   * @param description - Job description
   * @param timeoutMs - Maximum wait time in milliseconds
   */
  async waitForClaimJobCompletion(description: string, timeoutMs: number = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      await this.clickRefresh();
      const status = await this.getJobStatus(description);
      
      if (!status.includes('Running in a batch job')) {
        return true;
      }
      
      await this.page.waitForTimeout(3000); // Wait 3 seconds before checking again
    }
    
    throw new Error(`Claim job did not complete within ${timeoutMs}ms`);
  }

  /**
   * Get number of clean claims from status
   * @param description - Job description
   * @returns Number of clean claims or -1 if not found
   */
  async getCleanClaimsCount(description: string): Promise<number> {
    const status = await this.getJobStatus(description);
    const match = status.match(/Clean claims:\s*(\d+)/i);
    return match ? parseInt(match[1]) : -1;
  }

  /**
   * Click action button for a job
   * @param description - Job description
   */
  async clickJobAction(description: string) {
    const row = this.getJobRowByDescription(description);
    const actionButton = row.locator('button, a').last();
    await this.clickElement(actionButton);
  }

  /**
   * Verify claims page has loaded correctly
   */
  async verifyPageLoaded() {
    await this.waitForElement(this.servicesFromDatePicker);
    await this.waitForElement(this.startButton);
  }
}
