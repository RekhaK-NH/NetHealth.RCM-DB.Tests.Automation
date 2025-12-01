import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object for RCM Direct Billing - Patient Search/Reconcile Patients
 * Handles patient search functionality with various filter options
 */
export class PatientSearchPage extends BasePage {
  // Navigation locators
  private get patientsTab() {
    return this.page.getByRole('link', { name: 'Patients' });
  }

  private get searchSubTab() {
    return this.page.getByRole('link', { name: 'Search' });
  }

  private get reconcilePatientsSubTab() {
    return this.page.getByRole('link', { name: 'Reconcile Patients' });
  }

  // Filter locators
  private get agencySiteDropdown() {
    return this.page.locator('select[name*="Agency"], select[name*="Site"], #agency, #site').first();
  }

  private get branchDropdown() {
    return this.page.locator('select[name*="Branch"], #branch').first();
  }

  private get lastNameInput() {
    return this.page.locator('input[name*="LastName"], input[name*="lastname"], #lastname').first();
  }

  private get holdFRPStatementDropdown() {
    return this.page.locator('select[name*="HoldFRP"], select[name*="Statement"], #holdfrp').first();
  }

  private get additionalCriteriaDropdown() {
    return this.page.locator('select[name*="Additional"], select[name*="Criteria"]').first();
  }

  private get searchButton() {
    return this.page.getByRole('button', { name: /Search/i });
  }

  // Results table locators
  private get resultsTable() {
    return this.page.locator('table').first();
  }

  private get noResultsMessage() {
    return this.page.getByText(/No Patients to display/i);
  }

  private get showEntriesDropdown() {
    return this.page.locator('select[name*="length"]');
  }

  // Table column headers
  private get lastNameColumn() {
    return this.page.getByRole('columnheader', { name: /Last Name/i });
  }

  private get firstNameColumn() {
    return this.page.getByRole('columnheader', { name: /First Name/i });
  }

  private get accountNoColumn() {
    return this.page.getByRole('columnheader', { name: /Account No/i });
  }

  private get entityColumn() {
    return this.page.getByRole('columnheader', { name: /Entity/i });
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Patient Search page
   */
  async navigateToPatientSearch() {
    await this.clickElement(this.patientsTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Reconcile Patients page
   */
  async navigateToReconcilePatients() {
    await this.clickElement(this.patientsTab);
    await this.clickElement(this.reconcilePatientsSubTab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select agency/site from dropdown
   * @param agencyName - The name of the agency/site to select
   */
  async selectAgencySite(agencyName: string) {
    await this.waitForElement(this.agencySiteDropdown);
    await this.agencySiteDropdown.selectOption({ label: agencyName });
    await this.page.waitForTimeout(500); // Wait for branch dropdown to populate
  }

  /**
   * Select branch from dropdown
   * @param branchName - The name of the branch to select
   */
  async selectBranch(branchName: string) {
    await this.waitForElement(this.branchDropdown);
    await this.branchDropdown.selectOption({ label: branchName });
  }

  /**
   * Enter last name in search field
   * @param lastName - The last name to search for
   */
  async enterLastName(lastName: string) {
    await this.fillInput(this.lastNameInput, lastName);
  }

  /**
   * Select Hold FRP Statement option
   * @param option - The option to select (e.g., "All", "Yes", "No")
   */
  async selectHoldFRPStatement(option: string) {
    await this.waitForElement(this.holdFRPStatementDropdown);
    await this.holdFRPStatementDropdown.selectOption({ label: option });
  }

  /**
   * Select additional search criteria
   * @param criteria - The criteria to select
   */
  async selectAdditionalCriteria(criteria: string) {
    await this.waitForElement(this.additionalCriteriaDropdown);
    await this.additionalCriteriaDropdown.selectOption({ label: criteria });
  }

  /**
   * Click the Search button
   */
  async clickSearch() {
    await this.clickElement(this.searchButton);
    await this.page.waitForLoadState('networkidle');
    // Wait for results to load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Perform complete patient search
   * @param searchParams - Object containing search parameters
   */
  async searchPatient(searchParams: {
    agencySite?: string;
    branch?: string;
    lastName?: string;
    holdFRPStatement?: string;
  }) {
    if (searchParams.agencySite) {
      await this.selectAgencySite(searchParams.agencySite);
    }
    
    if (searchParams.branch) {
      await this.selectBranch(searchParams.branch);
    }
    
    if (searchParams.lastName) {
      await this.enterLastName(searchParams.lastName);
    }
    
    if (searchParams.holdFRPStatement) {
      await this.selectHoldFRPStatement(searchParams.holdFRPStatement);
    }

    await this.clickSearch();
  }

  /**
   * Check if search results are displayed
   * @returns true if results table is visible
   */
  async hasSearchResults(): Promise<boolean> {
    try {
      const noResults = await this.noResultsMessage.isVisible({ timeout: 2000 });
      if (noResults) return false;
      
      await this.waitForElement(this.resultsTable);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get patient row by account number
   * @param accountNo - The account number to find
   * @returns Locator for the patient row
   */
  getPatientRowByAccountNo(accountNo: string): Locator {
    return this.page.locator(`tr:has-text("${accountNo}")`).first();
  }

  /**
   * Get patient row by last name
   * @param lastName - The last name to find
   * @returns Locator for the patient row
   */
  getPatientRowByLastName(lastName: string): Locator {
    return this.page.locator(`tr:has-text("${lastName}")`).first();
  }

  /**
   * Click action button for a patient
   * @param accountNo - The account number
   */
  async clickPatientAction(accountNo: string) {
    const row = this.getPatientRowByAccountNo(accountNo);
    const actionButton = row.locator('button, a').last();
    await this.clickElement(actionButton);
  }

  /**
   * Set number of entries to display
   * @param count - Number of entries (10, 25, 50, 100)
   */
  async setShowEntries(count: number) {
    await this.waitForElement(this.showEntriesDropdown);
    await this.showEntriesDropdown.selectOption({ label: count.toString() });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get total number of patient records found
   * @returns Number of records shown in the footer
   */
  async getTotalRecords(): Promise<number> {
    const footer = this.page.locator('text=/Showing \\d+ to \\d+ of (\\d+) entries/');
    const text = await footer.textContent();
    
    if (text) {
      const match = text.match(/of (\d+) entries/);
      return match ? parseInt(match[1]) : 0;
    }
    
    return 0;
  }

  /**
   * Verify search page has loaded correctly
   */
  async verifyPageLoaded() {
    await this.waitForElement(this.searchButton);
    await this.waitForElement(this.agencySiteDropdown);
  }
}
