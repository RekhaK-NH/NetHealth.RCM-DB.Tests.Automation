# RCM Direct Billing Test Specification - Claims Management

## Feature: Claims Creation, Batching, and Management

### Background
As a billing specialist, I need to create claims, manage claim batches, and process FRP statements for patient billing.

---

## Test Plan: Create Claims Workflow

### Scenario 1: Create Claims for Date Range
**Priority:** Critical  
**Tags:** @smoke @functional @claims @create-claims

**Given** I am logged into the RCM Direct Billing application  
**When** I navigate to Claims > Create Claims  
**And** I set Services From date to "30 days ago"  
**And** I set Services Through date to "today"  
**And** I set Job Limit to "25"  
**And** I click the Start button  
**Then** a new claim generation job should be created  
**And** the job should appear in the job list  
**And** the job status should show either "Running in a batch job" or "Clean claims: X"

---

### Scenario 2: Create Claims with Division Filter
**Priority:** High  
**Tags:** @regression @functional @claims

**Given** I am on the Create Claims page  
**When** I configure:
  - Services From: "14 days ago"
  - Services Through: "today"
  - Division: "All Divisions"
  - Job Limit: "25"  
**And** I click the Start button  
**Then** the system should create a claim generation job  
**And** the job should process claims for all divisions

---

### Scenario 3: Create Claims with Payer and Plan Selection
**Priority:** High  
**Tags:** @regression @e2e @claims

**Given** I am on the Create Claims page  
**When** I set date range to last 7 days  
**And** I select "Medicare" from Paying Agency dropdown  
**And** I select "Part A" from Plan dropdown  
**And** I click Start  
**Then** the system should create claims for Medicare Part A only  
**And** the job description should include the payer information

---

### Scenario 4: Require Month-End Close Option
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the Create Claims page  
**When** I check the "Require month-end close to bill for services" checkbox  
**And** I configure date and payer filters  
**And** I click Start  
**Then** the system should only generate claims for closed billing periods  
**And** open periods should be excluded from claim generation

---

### Scenario 5: Require All Charges Posted Option
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the Create Claims page  
**When** I check the "Require all charges for customer to be posted before creating claim" checkbox  
**And** I configure filters and click Start  
**Then** the system should only generate claims for customers with all charges posted  
**And** customers with pending charges should be excluded

---

### Scenario 6: Monitor Claim Job Completion
**Priority:** High  
**Tags:** @regression @functional @claims

**Given** I have initiated a claim generation job  
**When** I periodically click Refresh (every 3 seconds)  
**Then** I should see the job status update from "Running" to completed  
**And** the final status should show "Clean claims: X, warnings: Y, errors: Z"  
**And** the job should complete within reasonable time (< 60 seconds for small datasets)

---

### Scenario 7: Verify Clean Claims Count
**Priority:** High  
**Tags:** @regression @functional @claims

**Given** A claim generation job has completed  
**When** I view the job status  
**Then** the status should display "Clean claims: X" where X >= 0  
**And** clicking the job action button should show claim details

---

### Scenario 8: Test Hierarchical Filter Dependencies
**Priority:** High  
**Tags:** @regression @functional @claims

**Given** I am on the Create Claims page  
**When** I select a Division  
**Then** the Region dropdown should populate with relevant regions  
**When** I select a Region  
**Then** the Area dropdown should populate with relevant areas  
**When** I select an Area  
**Then** the Entity dropdown should show appropriate entities  
**And** all dependent dropdowns should enable/disable appropriately

---

## Test Plan: Claim Search Workflow

### Scenario 9: Navigate to Claim Search
**Priority:** High  
**Tags:** @smoke @functional @claims @search

**Given** I am logged into the application  
**When** I navigate to Claims > Search  
**Then** the Claim Search page should load  
**And** search filters should be displayed  
**And** page should load within 5 seconds

---

### Scenario 10: Search Claims with Filters
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the Claim Search page  
**When** I configure search filters  
**And** I execute the search  
**Then** matching claims should be displayed in results table  
**And** claim details should include: Claim ID, Patient, Payer, Amount, Status

---

## Test Plan: Batch Claims Workflow

### Scenario 11: Navigate to Batch Claims
**Priority:** High  
**Tags:** @smoke @functional @claims @batch

**Given** I am logged into the application  
**When** I navigate to Claims > Batch Claims  
**Then** the Batch Claims page should load  
**And** batch processing options should be available

---

### Scenario 12: Manage Claim Batches
**Priority:** Critical  
**Tags:** @smoke @functional @claims @manage-batches

**Given** I am logged into the application  
**When** I navigate to Claims > Manage Claim Batches  
**Then** the Manage Claim Batches page should load  
**And** I should see a list of existing claim batches  
**And** each batch should display: Batch ID, Date, Status, Claim Count

---

### Scenario 13: Batch Operations
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the Manage Claim Batches page  
**When** I select a batch from the list  
**Then** I should be able to perform actions: View, Edit, Submit, Delete  
**And** each action should execute within 5 seconds

---

## Test Plan: FRP Statements Workflow

### Scenario 14: Navigate to FRP Statements
**Priority:** High  
**Tags:** @smoke @functional @claims @frp-statements

**Given** I am logged into the application  
**When** I navigate to Claims > FRP Statements  
**Then** the FRP Statements page should load  
**And** statement management options should be displayed

---

### Scenario 15: Generate FRP Statements
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the FRP Statements page  
**When** I configure statement generation filters  
**And** I initiate statement generation  
**Then** the system should create FRP statements for eligible patients  
**And** statement status should be tracked

---

## Test Plan: Rebill Information Workflow

### Scenario 16: Navigate to Rebill Info
**Priority:** Medium  
**Tags:** @smoke @functional @claims @rebill

**Given** I am logged into the application  
**When** I navigate to Claims > Rebill Info  
**Then** the Rebill Info page should load  
**And** rebill management options should be available

---

### Scenario 17: Manage Rebill Information
**Priority:** Medium  
**Tags:** @regression @functional @claims

**Given** I am on the Rebill Info page  
**When** I search for claims requiring rebill  
**Then** the system should display claims with rebill status  
**And** I should be able to update rebill information

---

## Expected Behaviors

### Performance Requirements
- Claim generation job initiation: < 3 seconds
- Job list refresh: < 5 seconds
- Claim search: < 10 seconds
- Batch operations: < 5 seconds
- Job completion time varies by volume (typically 30-120 seconds)

### Data Validation
- Date fields accept MM/DD/YYYY format
- Services Through >= Services From
- Job Limit: 10, 25, 50, or 100
- Payer and Plan selections must be valid combinations

### Error Handling
- Handle timeouts during claim generation
- Display validation errors clearly
- Prevent duplicate claim generation
- Handle claim processing failures gracefully

### Claim Processing Rules
- Only process charges that are posted and approved
- Respect month-end close requirements when checked
- Validate payer eligibility before claim generation
- Track clean claims vs. claims with warnings/errors

---

## Test Data Requirements

### Payers and Plans
- Multiple payers (Medicare, Medicaid, Private Insurance)
- Various plan types per payer
- Valid payer-plan combinations

### Organizational Data
- Complete hierarchy: Division > Region > Area > Entity
- Multiple entities for testing

### Date Ranges
- Recent date ranges (last 7, 14, 30 days)
- Month-end boundaries
- Closed and open billing periods

### Claim Data
- Posted charges ready for claiming
- Customers with complete charge data
- Customers with pending charges
- Various claim statuses

---

## Notes for AI-Powered Test Generation
- Implement robust waiting for async job completion
- Use polling mechanism with timeout for job monitoring
- Test concurrent claim generation scenarios
- Verify claim data integrity after generation
- Test edge cases: zero claims, large claim volumes
- Validate claim batch export functionality
- Ensure proper error handling and user feedback
- Test claim resubmission workflows
