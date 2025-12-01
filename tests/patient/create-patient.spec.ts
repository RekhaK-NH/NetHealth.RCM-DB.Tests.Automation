/**
 * @feature Patient Management
 * @module Create Patient
 * @description Tests for creating patient records in RCM-DB
 * @tags @patient @functional
 */

import { test, expect } from '../../fixtures';
import { TestDataGenerator } from '../../utils/test-data-generator';

test.describe('Patient Management - Create Patient @patient', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to patients section
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
  });

  test('create new patient with valid data @smoke @functional @critical', async ({ page, patientData }) => {
    await test.step('Navigate to create patient form', async () => {
      await page.getByRole('button', { name: 'New Patient' }).click();
      await expect(page.getByRole('heading', { name: 'Create Patient' })).toBeVisible();
    });

    await test.step('Fill patient demographics', async () => {
      await page.getByLabel('First Name').fill(patientData.firstName);
      await page.getByLabel('Last Name').fill(patientData.lastName);
      await page.getByLabel('Date of Birth').fill(patientData.dob);
      await page.getByLabel('Gender').selectOption(patientData.gender);
      await page.getByLabel('SSN').fill(patientData.ssn);
    });

    await test.step('Fill contact information', async () => {
      await page.getByLabel('Email').fill(patientData.email);
      await page.getByLabel('Phone').fill(patientData.phone);
      await page.getByLabel('Address').fill(patientData.address.street);
      await page.getByLabel('City').fill(patientData.address.city);
      await page.getByLabel('State').selectOption(patientData.address.state);
      await page.getByLabel('Zip Code').fill(patientData.address.zip);
    });

    await test.step('Save patient record', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Patient created successfully')).toBeVisible();
    });

    await test.step('Verify patient appears in list', async () => {
      await page.goto('/patients');
      await expect(page.getByText(`${patientData.lastName}, ${patientData.firstName}`)).toBeVisible();
    });
  });

  test('validate required fields on patient creation @regression @functional @validation', async ({ page }) => {
    await page.getByRole('button', { name: 'New Patient' }).click();
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify validation messages
    await expect(page.getByText(/First Name.*required/i)).toBeVisible();
    await expect(page.getByText(/Last Name.*required/i)).toBeVisible();
    await expect(page.getByText(/Date of Birth.*required/i)).toBeVisible();
  });

  test('cancel patient creation discards changes @regression @functional', async ({ page }) => {
    await page.getByRole('button', { name: 'New Patient' }).click();
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify returned to patient list
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
  });
});
