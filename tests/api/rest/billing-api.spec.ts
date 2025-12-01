/**
 * @feature Billing Management
 * @module API Tests
 * @description API tests for RCM-DB billing endpoints
 * @tags @api @billing
 */

import { test, expect } from '@playwright/test';

const ENV = process.env.ENV || 'dev';
const envConfig = require(`../../config/${ENV}.config`).default;

test.describe('Billing API Tests @api @billing', () => {
  let apiContext: any;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    // Create API context
    apiContext = await playwright.request.newContext({
      baseURL: envConfig.apiURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    // Authenticate and get token
    const response = await apiContext.post('/auth/login', {
      data: {
        username: envConfig.users.defaultUser.username,
        password: envConfig.users.defaultUser.password,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    authToken = body.token;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('get billing records via API @smoke @api @functional', async () => {
    const response = await apiContext.get('/api/v1/billing', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('create billing record via API @regression @api @functional', async () => {
    const billingData = {
      patientId: '12345',
      invoiceNumber: `INV-${Date.now()}`,
      amount: 150.00,
      serviceDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    const response = await apiContext.post('/api/v1/billing', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: billingData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.invoiceNumber).toBe(billingData.invoiceNumber);
  });

  test('handle invalid billing data @regression @api @validation', async () => {
    const invalidData = {
      patientId: '', // Empty required field
      amount: -100, // Invalid amount
    };

    const response = await apiContext.post('/api/v1/billing', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('message');
  });
});
