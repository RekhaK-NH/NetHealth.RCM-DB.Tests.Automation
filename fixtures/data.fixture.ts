import { test as base } from '@playwright/test';
import { TestDataGenerator } from '../utils/test-data-generator';

type DataFixtures = {
  patientData: ReturnType<typeof TestDataGenerator.generatePatient>;
  billingData: ReturnType<typeof TestDataGenerator.generateBillingData>;
  claimData: ReturnType<typeof TestDataGenerator.generateClaim>;
  appointmentData: ReturnType<typeof TestDataGenerator.generateAppointment>;
  insuranceData: ReturnType<typeof TestDataGenerator.generateInsurance>;
};

export const test = base.extend<DataFixtures>({
  // Dynamic patient data
  patientData: async ({}, use) => {
    const patient = TestDataGenerator.generatePatient();
    await use(patient);
  },

  // Dynamic billing data
  billingData: async ({}, use) => {
    const billing = TestDataGenerator.generateBillingData();
    await use(billing);
  },

  // Dynamic claim data
  claimData: async ({}, use) => {
    const claim = TestDataGenerator.generateClaim();
    await use(claim);
  },

  // Dynamic appointment data
  appointmentData: async ({}, use) => {
    const appointment = TestDataGenerator.generateAppointment();
    await use(appointment);
  },

  // Dynamic insurance data
  insuranceData: async ({}, use) => {
    const insurance = TestDataGenerator.generateInsurance();
    await use(insurance);
  },
});

export { expect } from '@playwright/test';
