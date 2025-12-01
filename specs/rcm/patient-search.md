# RCM Direct Billing Test Specification - Patient Search

## Feature: Patient Search and Reconciliation

### Background
As a billing specialist, I need to search for patients using various criteria to manage their billing information and reconcile patient records.

---

## Test Plan: Patient Search Workflow

### Scenario 1: Basic Patient Search by Agency and Branch
**Priority:** Critical  
**Tags:** @smoke @functional @patients

**Given** I am logged into the RCM Direct Billing application  
**When** I navigate to the Patients > Search page  
**And** I select "Main Agency" from the Agency/Site dropdown  
**And** I select "Branch 1" from the Branch dropdown  
**And** I click the Search button  
**Then** the system should display a list of patients matching the criteria  
**And** the results table should show columns: Last Name, First Name, MI, Account No, Entity, Hold FRP Statement, Action

---

### Scenario 2: Search Patients by Last Name
**Priority:** High  
**Tags:** @smoke @functional @patients

**Given** I am on the Patient Search page  
**When** I enter "Smith" in the Last Name field  
**And** I click the Search button  
**Then** the system should filter and display only patients with last name containing "Smith"  
**And** the search should complete within 5 seconds

---

### Scenario 3: Filter by Hold FRP Statement Status
**Priority:** Medium  
**Tags:** @regression @functional @patients

**Given** I am on the Patient Search page  
**When** I select "All" from the Hold FRP Statement dropdown  
**And** I click the Search button  
**Then** the system should display all patients regardless of FRP statement status  
**And** the results should be paginated if more than 50 records exist

---

### Scenario 4: Combined Filter Search
**Priority:** High  
**Tags:** @regression @e2e @patients

**Given** I am on the Patient Search page  
**When** I configure the following filters:
  - Agency/Site: "Main Agency"
  - Branch: "Branch 1"
  - Last Name: "Johnson"
  - Hold FRP Statement: "All"  
**And** I click the Search button  
**Then** the system should display only patients matching ALL criteria  
**And** the total record count should be displayed in the footer

---

### Scenario 5: Adjust Results Display Limit
**Priority:** Medium  
**Tags:** @regression @functional @patients

**Given** I have search results displayed  
**When** I change the "Show entries" dropdown to "50"  
**Then** the table should display up to 50 patient records per page  
**And** pagination controls should update accordingly

---

### Scenario 6: Handle No Results Gracefully
**Priority:** Medium  
**Tags:** @regression @validation @patients

**Given** I am on the Patient Search page  
**When** I search for a non-existent patient with last name "ZZZZNONEXISTENT"  
**And** I click the Search button  
**Then** the system should display message "No Patients to display"  
**And** the footer should show "Showing 0 to 0 of 0 entries"

---

### Scenario 7: Navigate to Reconcile Patients
**Priority:** Medium  
**Tags:** @smoke @functional @patients

**Given** I am on the Patients page  
**When** I click on the "Reconcile Patients" tab  
**Then** the Reconcile Patients page should load  
**And** the appropriate reconciliation filters should be displayed

---

## Expected Behaviors

### Performance Requirements
- Patient search should complete within 5 seconds
- Page load time should be under 3 seconds
- Results should be paginated for large datasets

### Data Validation
- Agency/Site dropdown should be populated from active agencies
- Branch dropdown should populate based on selected agency
- Last Name field should accept alphanumeric characters
- Search should be case-insensitive

### Error Handling
- Display clear message when no results found
- Handle timeout gracefully if search takes too long
- Validate date inputs if date filters are present

---

## Test Data Requirements

### Sample Patients
- Multiple patients across different agencies
- Patients with various Hold FRP Statement statuses
- Patients with different entity assignments

### Filter Options
- At least 2 active agencies with multiple branches
- Various FRP statement status values

---

## Notes for AI-Powered Test Generation
- Use data-driven approach for filter combinations
- Implement proper wait strategies for dropdown dependencies
- Verify table sorting functionality
- Test pagination when result count exceeds page limit
- Consider accessibility testing for screen readers
