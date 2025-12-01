import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object for RCM Direct Billing - Revenue (Post Charges & Quick Claims)
 * Handles revenue management and charge posting functionality
 */
export class RevenuePage extends BasePage {
  // Navigation locators
  private get revenueTab() {
    return this.page.getByRole('link', { name: 'Revenue' });
  }

  private get postChargesSubTab() {
    return this.page.getByRole('link', { name: 'Post Charges' });
  }

  private get quickClaimsSubTab() {
    return this.page.getByRole('link', { name: 'Quick Claims' });
  }

  // Filter locators
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

  private get jobLimitDropdown() {
    return this.page.locator('select[name*="JobLimit"], select[name*="Limit"]').first();
  }

  private get refreshButton() {
    return this.page.getByRole('button', { name: /Refresh/i });
  }

  private get startButton() {
    return this.page.getByRole('button', { name: /Start/i });
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

  private get actionColumn() {
    return this.page.getByRole('columnheader', { name: /Action/i });
  }

  // Batch job status messages
  private get runningInBatchJobMessage() {
    return this.page.getByText(/Running in a batch job/i);
  }

  private get chargesToPostMessage() {
    return this.page.getByText(/Charges to post:/i);
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Revenue - Post Charges page
   */
  async navigateToPostCharges() {
    await this.clickElement(this.revenueTab);
    await this.clickElement(this.postChargesSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Revenue - Quick Claims page
   */
  async navigateToQuickClaims() {
    await this.clickElement(this.revenueTab);
    await this.clickElement(this.quickClaimsSubTab);
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
    await this.page.waitForTimeout(500); // Wait for dependent dropdowns
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
   * Set job limit
   * @param limit - Job limit number (25, 50, etc.)
   */
  async setJobLimit(limit: number) {
    await this.waitForElement(this.jobLimitDropdown);
    await this.jobLimitDropdown.selectOption({ label: limit.toString() });
  }

  /**
   * Configure revenue filters
   * @param filters - Object containing filter parameters
   */
  async configureFilters(filters: {
    servicesFrom?: string;
    servicesTo?: string;
    division?: string;
    region?: string;
    area?: string;
    entity?: string;
    jobLimit?: number;
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

    if (filters.jobLimit) {
      await this.setJobLimit(filters.jobLimit);
    }
  }

  /**
   * Click Refresh button to update job list
   */
  async clickRefresh() {
    await this.clickElement(this.refreshButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Start button to begin batch job
   */
  async clickStart() {
    await this.clickElement(this.startButton);
    await this.page.waitForTimeout(1000); // Wait for job to start
  }

  /**
   * Post charges with specified filters
   * @param filters - Revenue filter parameters
   */
  async postCharges(filters: {
    servicesFrom: string;
    servicesTo: string;
    division?: string;
    region?: string;
    area?: string;
    entity?: string;
  }) {
    await this.navigateToPostCharges();
    await this.configureFilters(filters);
    await this.clickStart();
  }

  /**
   * Check if batch job is running
   * @returns true if job is running
   */
  async isBatchJobRunning(): Promise<boolean> {
    return await this.runningInBatchJobMessage.isVisible({ timeout: 2000 }).catch(() => false);
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
   * @returns Status text (e.g., "Charges to post: 3", "Running in a batch job")
   */
  async getJobStatus(description: string): Promise<string> {
    const row = this.getJobRowByDescription(description);
    const statusCell = row.locator('td').nth(3); // Status column
    return await statusCell.textContent() || '';
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
   * Wait for job to complete
   * @param description - Job description
   * @param timeoutMs - Maximum wait time in milliseconds
   */
  async waitForJobCompletion(description: string, timeoutMs: number = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      await this.clickRefresh();
      const status = await this.getJobStatus(description);
      
      if (!status.includes('Running in a batch job')) {
        return true;
      }
      
      await this.page.waitForTimeout(2000); // Wait 2 seconds before checking again
    }
    
    throw new Error(`Job did not complete within ${timeoutMs}ms`);
  }

  /**
   * Verify revenue page has loaded correctly
   */
  async verifyPageLoaded() {
    await this.waitForElement(this.servicesFromDatePicker);
    await this.waitForElement(this.servicesToDatePicker);
    await this.waitForElement(this.startButton);
  }

  /**
   * Get requested by user from job row
   * @param description - Job description
   * @returns Username who requested the job
   */
  async getRequestedBy(description: string): Promise<string> {
    const row = this.getJobRowByDescription(description);
    const requestedByCell = row.locator('td').nth(1);
    return await requestedByCell.textContent() || '';
  }

  /**
   * Get requested on timestamp from job row
   * @param description - Job description
   * @returns Timestamp when job was requested
   */
  async getRequestedOn(description: string): Promise<string> {
    const row = this.getJobRowByDescription(description);
    const requestedOnCell = row.locator('td').nth(2);
    return await requestedOnCell.textContent() || '';
  }
}
