# Test Plan: Patient Management - Create Patient Flow

## Feature Overview
Patient creation functionality in NetHealth RCM-DB application.

## Test Scenarios

### 1. Create Patient with Valid Data
**Priority**: Critical  
**Tags**: @smoke @functional @patient

**Steps:**
1. Navigate to patients section
2. Click "New Patient" button
3. Fill patient demographics (First Name, Last Name, DOB, Gender, SSN)
4. Fill contact information (Email, Phone, Address)
5. Click "Save" button
6. Verify success message appears
7. Verify patient appears in patient list

**Expected Results:**
- Patient is created successfully
- Success message is displayed
- Patient appears in the list with correct information

---

### 2. Required Field Validation
**Priority**: High  
**Tags**: @regression @validation @patient

**Steps:**
1. Navigate to patients section
2. Click "New Patient" button
3. Click "Save" without filling any fields
4. Verify validation messages appear

**Expected Results:**
- Validation messages appear for required fields:
  - First Name is required
  - Last Name is required
  - Date of Birth is required

---

### 3. Cancel Patient Creation
**Priority**: Medium  
**Tags**: @regression @functional @patient

**Steps:**
1. Navigate to patients section
2. Click "New Patient" button
3. Fill some patient information
4. Click "Cancel" button
5. Verify user is returned to patient list

**Expected Results:**
- No patient is created
- User is returned to patient list
- Changes are discarded

---

### 4. Duplicate Patient Prevention
**Priority**: High  
**Tags**: @regression @validation @patient

**Steps:**
1. Create a patient with specific data
2. Try to create another patient with same SSN
3. Verify duplicate warning appears

**Expected Results:**
- System prevents duplicate patient creation
- Warning message is displayed
- User can choose to view existing patient or continue

---

## Test Data Requirements

- Valid patient demographics (generated dynamically)
- Valid contact information
- Test SSN numbers
- Various date formats for DOB

## Pre-conditions

- User is authenticated
- User has permission to create patients
- Application is in stable state

## Post-conditions

- Test patients are either cleaned up or marked for deletion
- No data pollution in test environment

---

**Note for Playwright Agents**: Use `TestDataGenerator.generatePatient()` for dynamic test data generation.
