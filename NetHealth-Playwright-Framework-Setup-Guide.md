# Net Health Playwright Test Framework Setup Guide

> **Purpose**: This document provides comprehensive guidance for setting up a standardized Playwright test automation framework for all Net Health applications, including RCM Direct Billing (Revenue Cycle Management). This guide supports both manual test creation and AI-powered test generation using Playwright Agents.

> **Version**: 1.0  
> **Last Updated**: November 2025  
> **Maintained By**: QE Team  
> **RCM Implementation**: Complete

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Installation & Playwright Agents Setup](#step-1-installation--playwright-agents-setup)
3. [Framework Folder Structure](#framework-folder-structure)
4. [Naming Conventions](#naming-conventions)
5. [Configuration Setup](#configuration-setup)
6. [Authentication & Session Management](#authentication--session-management)
7. [Test Data Management](#test-data-management)
8. [Tagging Strategy](#tagging-strategy)
9. [Page Object Pattern (Hybrid Approach)](#page-object-pattern-hybrid-approach)
10. [Sample Test Structure](#sample-test-structure)
11. [API Testing Setup](#api-testing-setup)
12. [Best Practices](#best-practices)
13. [Azure DevOps CI/CD Integration](#azure-devops-cicd-integration)
14. [Housekeeping Rules](#housekeeping-rules)
15. [Running Tests](#running-tests)
16. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the framework, ensure you have:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **TypeScript**: Will be installed as dependency
- **Git**: For version control
- **VS Code** (recommended): With Playwright extension
- **Azure DevOps**: Access to your project repository

---

## Step 1: Installation & Playwright Agents Setup

### 1.1 Initialize Node.js Project

```bash
# Create project directory
# mkdir your-app-name-e2e-tests
# cd your-app-name-e2e-tests

# Initialize package.json
npm init -y
```

### 1.2 Install Playwright

```bash
# Install Playwright with TypeScript support
npm install -D @playwright/test

# Install browsers (Chromium, Firefox, WebKit)
npx playwright install

# Install operating system dependencies
npx playwright install-deps
```

### 1.3 Initialize Playwright Agents (CRITICAL STEP)

Playwright Agents enable AI-powered test generation and maintenance. Choose your tool:

#### Option A: VS Code (Recommended for Local Development)

```bash
npx playwright init-agents --loop=vscode
```

#### Option B: Claude Code (For AI-Powered Development)

```bash
npx playwright init-agents --loop=claude
```

#### Option C: OpenCode

```bash
npx playwright init-agents --loop=opencode
```

**Important Notes:**
- This creates agent definitions in `.github/` directory
- Re-run this command whenever Playwright is updated
- Agent definitions include: 🎭 planner, 🎭 generator, and 🎭 healer

### 1.4 Install Additional Dependencies

```bash
# Install TypeScript and related tools
npm install -D typescript ts-node @types/node

# Install dotenv for environment variables
npm install -D dotenv

# Install Allure reporter (optional, for enhanced reporting)
npm install -D allure-playwright allure-commandline

# Install date utilities
npm install -D date-fns
```

### 1.5 Initialize TypeScript Configuration

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "@playwright/test"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "playwright-report", "test-results"]
}
```

### 1.6 Verify Installation

```bash
# Run Playwright test check
npx playwright test --version

# Run sample test
npx playwright test --reporter=list
```

---

## Framework Folder Structure

Create the following standardized folder structure:

```
your-app-name-e2e-tests/
├── .github/                          # Playwright Agent definitions (auto-generated)
│   ├── planner/                      # 🎭 Planner agent
│   ├── generator/                    # 🎭 Generator agent
│   └── healer/                       # 🎭 Healer agent
│
├── specs/                            # Markdown test plans (for agents)
│   ├── treatment-encounter-notes/
│   │   └── basic-operations.md
│   ├── patient-intake/
│   │   └── registration-flow.md
│   └── rcm/                          # RCM Direct Billing specs
│       ├── patient-search.md
│       ├── revenue-management.md
│       └── claims-management.md
│
├── tests/                            # Test files organized by feature
│   ├── seed.spec.ts                  # Seed test for environment setup
│   ├── treatment-encounter-notes/
│   │   ├── create-note.spec.ts
│   │   └── edit-note.spec.ts
│   ├── patient-intake/
│   │   ├── register-patient.spec.ts
│   │   └── search-patient.spec.ts
│   ├── rcm/                          # RCM Direct Billing tests
│   │   ├── patient-search.spec.ts
│   │   ├── revenue.spec.ts
│   │   ├── claims.spec.ts
│   │   └── e2e-workflows.spec.ts
│   └── api/
│       ├── rest/
│       │   ├── patient-api.spec.ts
│       │   └── billing-api.spec.ts
│       └── graphql/
│           └── encounter-api.spec.ts
│
├── pages/                            # Page objects (hybrid approach)
│   ├── base.page.ts                  # Base page with common methods
│   ├── login.page.ts
│   ├── treatment-encounter/
│   │   └── encounter-note.page.ts
│   ├── patient-intake/
│   │   └── patient-registration.page.ts
│   └── rcm/                          # RCM Direct Billing pages
│       ├── patient-search.page.ts
│       ├── revenue.page.ts
│       └── claims.page.ts
│
├── fixtures/                         # Custom fixtures and test setup
│   ├── index.ts                      # Export all fixtures
│   ├── auth.fixture.ts               # Authentication fixtures
│   └── data.fixture.ts               # Test data fixtures
│
├── utils/                            # Utility functions
│   ├── api-helper.ts                 # API utility functions
│   ├── date-helper.ts                # Date manipulation utilities
│   ├── test-data-generator.ts        # Dynamic test data generation
│   └── common-helpers.ts             # Shared helper functions
│
├── data/                             # Test data files
│   ├── dev/
│   │   ├── users.json
│   │   ├── test-data.json
│   │   └── rcm-test-data.json        # RCM-specific test data
│   ├── staging/
│   │   ├── users.json
│   │   └── test-data.json
│   └── prod/
│       ├── users.json
│       └── test-data.json
│
├── config/                           # Environment configurations
│   ├── dev.config.ts
│   ├── staging.config.ts
│   └── prod.config.ts
│
├── auth/                             # Stored authentication states
│   ├── admin-auth.json
│   ├── clinician-auth.json
│   └── .gitkeep
│
├── playwright.config.ts              # Main Playwright configuration
├── global-setup.ts                   # Global setup (auth, data prep)
├── global-teardown.ts                # Global teardown (cleanup)
├── .env                              # Environment variables (not in git)
├── .env.example                      # Example env variables (in git)
├── .gitignore                        # Git ignore rules
├── package.json                      # npm dependencies
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Project documentation
```

### Create Folder Structure Script

Save as `setup-folders.sh`:

```bash
#!/bin/bash

# Create directory structure
mkdir -p specs/{treatment-encounter-notes,patient-intake}
mkdir -p tests/{treatment-encounter-notes,patient-intake,api/{rest,graphql}}
mkdir -p pages/{treatment-encounter,patient-intake}
mkdir -p fixtures
mkdir -p utils
mkdir -p data/{dev,staging,prod}
mkdir -p config
mkdir -p auth

# Create placeholder files
touch tests/seed.spec.ts
touch pages/base.page.ts
touch fixtures/index.ts
touch auth/.gitkeep
touch .env.example

echo "Folder structure created successfully!"
```

Run: `bash setup-folders.sh`

---

## Naming Conventions

### Test Files

**Format**: `{action}-{entity}-{scenario}.spec.ts`

**Rules**:
- Use kebab-case for file names
- Include `.spec.ts` extension
- Be descriptive and specific
- Group related tests in folders

**Examples**:
```
✅ Good:
- create-encounter-note-valid-data.spec.ts
- search-patient-by-mrn.spec.ts
- edit-patient-demographics.spec.ts
- delete-appointment-with-confirmation.spec.ts
- patient-search-with-filters.spec.ts (RCM)
- post-charges-batch-process.spec.ts (RCM)
- create-claims-with-validation.spec.ts (RCM)

❌ Bad:
- test1.spec.ts
- encounterTest.spec.ts
- PATIENT_SEARCH.spec.ts
```

### Page Object Files

**Format**: `{feature-name}.page.ts`

**Rules**:
- Use kebab-case
- Include `.page.ts` extension
- One page class per file
- Use PascalCase for class names

**Examples**:
```typescript
✅ Good:
- login.page.ts → LoginPage class
- encounter-note.page.ts → EncounterNotePage class
- patient-search.page.ts → PatientSearchPage class (RCM)
- revenue.page.ts → RevenuePage class (RCM)
- claims.page.ts → ClaimsPage class (RCM)

❌ Bad:
- Login.ts
- encounternote.page.ts
- patient-Search-Page.ts
```

### Utility Files

**Format**: `{purpose}-helper.ts` or `{purpose}-utils.ts`

**Examples**:
```
✅ Good:
- api-helper.ts
- date-helper.ts
- test-data-generator.ts

❌ Bad:
- utils.ts
- helper.ts
```

### Test Names (Test Titles)

**Format**: `{action} {entity} {scenario} {tags}`

**Rules**:
- Use descriptive, action-oriented titles
- Include relevant tags at the end
- Use present tense
- Keep under 100 characters

**Examples**:
```typescript
✅ Good:
test('create encounter note with valid patient data @smoke @functional @e2e', async ({ page }) => {
  // Test implementation
});

test('verify patient search filters multiple criteria @regression @functional', async ({ page }) => {
  // Test implementation
});

test('update patient demographics and verify changes @smoke @critical @ai-generated', async ({ page }) => {
  // Test implementation
});

❌ Bad:
test('test1', async ({ page }) => {});
test('This is a really long test name that describes everything in excruciating detail including all steps', async ({ page }) => {});
```

### Variable Naming

**Rules**:
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Use UPPER_SNAKE_CASE for constants
- Be descriptive and meaningful

**Examples**:
```typescript
// Variables and functions
const patientFirstName = 'John';
const encounterNoteId = '12345';
async function createPatient() { }
async function verifyEncounterNoteCreated() { }

// Classes and types
class PatientRegistrationPage { }
type UserCredentials = { username: string; password: string };

// Constants
const BASE_URL = 'https://app.nethealth.com';
const DEFAULT_TIMEOUT = 30000;
const API_ENDPOINTS = {
  PATIENT: '/api/v1/patient',
  ENCOUNTER: '/api/v1/encounter'
};
```

---

## Configuration Setup

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Determine environment (default to 'dev')
const ENV = process.env.ENV || 'dev';

// Import environment-specific config
const envConfig = require(`./config/${ENV}.config`).default;

export default defineConfig({
  testDir: './tests',
  
  // Timeout settings
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 2 : undefined, // Limit workers in CI
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Console output
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  // Shared settings for all projects
  use: {
    baseURL: envConfig.baseURL,
    
    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Tracing and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Network settings
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  // Project definitions for different test types
  projects: [
    // Setup project - runs first to prepare auth states
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },

    // Chromium - Desktop
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/clinician-auth.json', // Default auth state
      },
      dependencies: ['setup'],
    },

    // Firefox - Desktop
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth/clinician-auth.json',
      },
      dependencies: ['setup'],
    },

    // WebKit - Desktop
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'auth/clinician-auth.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'auth/clinician-auth.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        storageState: 'auth/clinician-auth.json',
      },
      dependencies: ['setup'],
    },

    // API Testing project (no browser needed)
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: envConfig.apiURL,
      },
    },

    // Tagged test projects
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      grep: /@smoke/,
      dependencies: ['setup'],
    },

    {
      name: 'regression',
      use: { ...devices['Desktop Chrome'] },
      grep: /@regression/,
      grepInvert: /@smoke/, // Exclude smoke tests
      dependencies: ['setup'],
    },

    {
      name: 'critical',
      use: { ...devices['Desktop Chrome'] },
      grep: /@critical/,
      dependencies: ['setup'],
    },

    {
      name: 'ai-generated',
      use: { ...devices['Desktop Chrome'] },
      grep: /@ai-generated/,
      dependencies: ['setup'],
    },
  ],

  // Development server (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
```

### Environment Configuration Files

#### config/dev.config.ts

```typescript
export default {
  name: 'Development',
  baseURL: process.env.DEV_BASE_URL || 'https://dev.nethealth.com',
  loginURL: process.env.DEV_LOGIN_URL || 'https://basereg.therapy.nethealth.com/Login/',
  apiURL: process.env.DEV_API_URL || 'https://api-dev.nethealth.com',
  timeout: 30000,
  retries: 1,
  users: {
    admin: {
      username: process.env.DEV_ADMIN_USER || 'admin@nethealth.com',
      password: process.env.DEV_ADMIN_PASS || '',
    },
    clinician: {
      username: process.env.DEV_CLINICIAN_USER || 'clinician@nethealth.com',
      password: process.env.DEV_CLINICIAN_PASS || '',
    },
    rcm: {
      username: process.env.DEV_RCM_USER || 'Optima.RambabuN',
      password: process.env.DEV_RCM_PASS || 'Password@123',
    },
  },
  // RCM Direct Billing module endpoints
  modules: {
    patients: '/Patients/PatientSearch',
    revenue: '/Revenue/PostCharges',
    claims: '/Claims/CreateClaims',
  },
};
```

#### config/staging.config.ts

```typescript
export default {
  name: 'Staging',
  baseURL: process.env.STAGING_BASE_URL || 'https://staging.nethealth.com',
  apiURL: process.env.STAGING_API_URL || 'https://api-staging.nethealth.com',
  timeout: 30000,
  retries: 2,
  users: {
    admin: {
      username: process.env.STAGING_ADMIN_USER || 'admin@nethealth.com',
      password: process.env.STAGING_ADMIN_PASS || '',
    },
    clinician: {
      username: process.env.STAGING_CLINICIAN_USER || 'clinician@nethealth.com',
      password: process.env.STAGING_CLINICIAN_PASS || '',
    },
  },
};
```

#### config/prod.config.ts

```typescript
export default {
  name: 'Production',
  baseURL: process.env.PROD_BASE_URL || 'https://app.nethealth.com',
  apiURL: process.env.PROD_API_URL || 'https://api.nethealth.com',
  timeout: 30000,
  retries: 3,
  users: {
    admin: {
      username: process.env.PROD_ADMIN_USER || '',
      password: process.env.PROD_ADMIN_PASS || '',
    },
    clinician: {
      username: process.env.PROD_CLINICIAN_USER || '',
      password: process.env.PROD_CLINICIAN_PASS || '',
    },
  },
};
```

### .env.example

```bash
# Environment Selection
ENV=dev

# Development Environment
DEV_BASE_URL=https://dev.nethealth.com
DEV_LOGIN_URL=https://basereg.therapy.nethealth.com/Login/
DEV_API_URL=https://api-dev.nethealth.com
DEV_ADMIN_USER=admin@nethealth.com
DEV_ADMIN_PASS=
DEV_CLINICIAN_USER=clinician@nethealth.com
DEV_CLINICIAN_PASS=
DEV_RCM_USER=Optima.RambabuN
DEV_RCM_PASS=Password@123

# Staging Environment
STAGING_BASE_URL=https://staging.nethealth.com
STAGING_API_URL=https://api-staging.nethealth.com
STAGING_ADMIN_USER=admin@nethealth.com
STAGING_ADMIN_PASS=
STAGING_CLINICIAN_USER=clinician@nethealth.com
STAGING_CLINICIAN_PASS=

# Production Environment
PROD_BASE_URL=https://app.nethealth.com
PROD_API_URL=https://api.nethealth.com
PROD_ADMIN_USER=
PROD_ADMIN_PASS=
PROD_CLINICIAN_USER=
PROD_CLINICIAN_PASS=

# Test Configuration
HEADLESS=true
SLOW_MO=0
VIDEO=false
TRACE=false
```

---

## Authentication & Session Management

### global-setup.ts

```typescript
import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.ENV || 'dev';
const envConfig = require(`./config/${ENV}.config`).default;

async function globalSetup(config: FullConfig) {
  console.log(`🚀 Starting global setup for ${envConfig.name} environment...`);

  // Ensure auth directory exists
  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Setup authentication states for different user types
  await setupAuth('admin', envConfig.users.admin);
  await setupAuth('clinician', envConfig.users.clinician);

  console.log('✅ Global setup completed successfully!');
}

async function setupAuth(userType: string, credentials: { username: string; password: string }) {
  const authFile = path.join(__dirname, 'auth', `${userType}-auth.json`);

  console.log(`🔐 Setting up ${userType} authentication...`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(envConfig.baseURL + '/login');

    // Perform login - CUSTOMIZE THESE SELECTORS FOR YOUR APP
    await page.getByLabel('Username').fill(credentials.username);
    await page.getByLabel('Password').fill(credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for successful login (customize this selector)
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // Save authentication state
    await context.storageState({ path: authFile });
    console.log(`✅ ${userType} auth state saved to ${authFile}`);

  } catch (error) {
    console.error(`❌ Failed to setup ${userType} authentication:`, error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
```

### global-teardown.ts

```typescript
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global teardown...');

  // Optional: Clean up auth files if needed
  // const authDir = path.join(__dirname, 'auth');
  // if (fs.existsSync(authDir)) {
  //   fs.readdirSync(authDir).forEach(file => {
  //     if (file.endsWith('.json')) {
  //       fs.unlinkSync(path.join(authDir, file));
  //     }
  //   });
  // }

  // Optional: Clean up test data
  // await cleanupTestData();

  console.log('✅ Global teardown completed!');
}

export default globalTeardown;
```

### Authentication Fixtures

Create `fixtures/auth.fixture.ts`:

```typescript
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  authenticatedPage: Page;
  loginAsAdmin: Page;
  loginAsClinician: Page;
};

export const test = base.extend<AuthFixtures>({
  // Default authenticated page (uses saved auth state)
  authenticatedPage: async ({ page }, use) => {
    // Page already has auth state from playwright.config.ts
    await page.goto('/dashboard');
    await use(page);
  },

  // Login as admin on-demand (without using saved state)
  loginAsAdmin: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    
    const ENV = process.env.ENV || 'dev';
    const envConfig = require(`../config/${ENV}.config`).default;
    
    await loginPage.login(
      envConfig.users.admin.username,
      envConfig.users.admin.password
    );
    
    await use(page);
    await context.close();
  },

  // Login as clinician on-demand (without using saved state)
  loginAsClinician: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    
    const ENV = process.env.ENV || 'dev';
    const envConfig = require(`../config/${ENV}.config`).default;
    
    await loginPage.login(
      envConfig.users.clinician.username,
      envConfig.users.clinician.password
    );
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```

---

## Test Data Management

### Combination Approach: JSON + Dynamic Generation

#### data/dev/users.json

```json
{
  "admin": {
    "username": "admin@nethealth.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "Administrator"
  },
  "clinician": {
    "username": "clinician@nethealth.com",
    "firstName": "Dr. Sarah",
    "lastName": "Johnson",
    "role": "Clinician",
    "npi": "1234567890"
  },
  "patients": [
    {
      "mrn": "MRN-001",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1980-01-15",
      "gender": "Male"
    },
    {
      "mrn": "MRN-002",
      "firstName": "Jane",
      "lastName": "Smith",
      "dob": "1992-05-22",
      "gender": "Female"
    }
  ]
}
```

#### data/dev/test-data.json

```json
{
  "encounterNotes": {
    "valid": {
      "chiefComplaint": "Routine follow-up",
      "diagnosis": "Type 2 Diabetes Mellitus",
      "treatment": "Continue current medication regimen"
    }
  },
  "appointments": {
    "valid": {
      "type": "Follow-up",
      "duration": 30,
      "location": "Main Clinic"
    }
  }
}
```

#### utils/test-data-generator.ts

```typescript
import { faker } from '@faker-js/faker';

export class TestDataGenerator {
  /**
   * Generate random patient data
   */
  static generatePatient() {
    return {
      mrn: `MRN-${faker.string.numeric(6)}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dob: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      ssn: faker.string.numeric(9),
      phone: faker.phone.number('###-###-####'),
      email: faker.internet.email(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode('#####'),
      },
    };
  }

  /**
   * Generate encounter note data
   */
  static generateEncounterNote() {
    return {
      date: faker.date.recent().toISOString().split('T')[0],
      chiefComplaint: faker.helpers.arrayElement([
        'Routine follow-up',
        'Acute pain management',
        'Medication review',
        'Annual physical exam',
      ]),
      diagnosis: faker.helpers.arrayElement([
        'Type 2 Diabetes Mellitus',
        'Hypertension',
        'Lower back pain',
        'Upper respiratory infection',
      ]),
      treatment: faker.lorem.sentence(),
      notes: faker.lorem.paragraph(),
    };
  }

  /**
   * Generate appointment data
   */
  static generateAppointment() {
    return {
      type: faker.helpers.arrayElement(['Follow-up', 'New Patient', 'Consultation', 'Procedure']),
      date: faker.date.future().toISOString().split('T')[0],
      time: faker.date.future().toTimeString().substring(0, 5),
      duration: faker.helpers.arrayElement([15, 30, 45, 60]),
      location: faker.helpers.arrayElement(['Main Clinic', 'Outpatient Center', 'Specialty Clinic']),
      provider: `Dr. ${faker.person.fullName()}`,
    };
  }

  /**
   * Generate unique identifier
   */
  static generateUniqueId(prefix: string = 'TEST'): string {
    return `${prefix}-${Date.now()}-${faker.string.alphanumeric(6).toUpperCase()}`;
  }
}
```

#### fixtures/data.fixture.ts

```typescript
import { test as base } from '@playwright/test';
import { TestDataGenerator } from '../utils/test-data-generator';
import testData from '../data/dev/test-data.json';
import users from '../data/dev/users.json';

type DataFixtures = {
  testData: typeof testData;
  users: typeof users;
  patientData: ReturnType<typeof TestDataGenerator.generatePatient>;
  encounterData: ReturnType<typeof TestDataGenerator.generateEncounterNote>;
  appointmentData: ReturnType<typeof TestDataGenerator.generateAppointment>;
};

export const test = base.extend<DataFixtures>({
  // Static test data from JSON
  testData: async ({}, use) => {
    await use(testData);
  },

  // User data from JSON
  users: async ({}, use) => {
    await use(users);
  },

  // Dynamic patient data
  patientData: async ({}, use) => {
    const patient = TestDataGenerator.generatePatient();
    await use(patient);
  },

  // Dynamic encounter data
  encounterData: async ({}, use) => {
    const encounter = TestDataGenerator.generateEncounterNote();
    await use(encounter);
  },

  // Dynamic appointment data
  appointmentData: async ({}, use) => {
    const appointment = TestDataGenerator.generateAppointment();
    await use(appointment);
  },
});

export { expect } from '@playwright/test';
```

#### fixtures/index.ts

```typescript
// Export all fixtures from a single location
export { test, expect } from './auth.fixture';
export { test as dataTest } from './data.fixture';
```

---

## Tagging Strategy

### Tag Categories (For Metrics Tracking)

The tagging approach supports tracking **AI-Generated Code Quality Index** and **Test Coverage Efficiency Score**.

#### 1. Execution Level Tags
- `@smoke` - Critical functionality, quick validation (5-10 min)
- `@regression` - Comprehensive test coverage (30+ min)
- `@e2e` - End-to-end user workflows
- `@integration` - Integration between systems

#### 2. Priority Tags
- `@critical` - Production-critical functionality
- `@high` - High-priority features
- `@medium` - Standard priority
- `@low` - Low priority, nice-to-have

#### 3. Test Origin Tags (For AI Metrics)
- `@ai-generated` - Tests generated by Playwright Agents
- `@manual-conversion` - Manual tests converted to automation
- `@traditional` - Traditionally written tests

#### 4. Test Type Tags
- `@functional` - Functional testing
- `@api` - API testing
- `@performance` - Performance testing
- `@accessibility` - Accessibility testing
- `@security` - Security testing
- `@visual` - Visual regression testing

#### 5. Feature Area Tags
- `@treatment-encounter-notes` - Treatment Encounter Notes feature
- `@patient-intake` - Patient intake and registration
- `@billing` - Billing functionality
- `@clinical-docs` - Clinical documentation
- `@scheduling` - Appointment scheduling
- `@reporting` - Reporting features
- `@rcm` - RCM Direct Billing (Revenue Cycle Management)
- `@patients` - RCM Patient Search and Reconciliation
- `@revenue` - RCM Revenue Management (Post Charges, Quick Claims)
- `@claims` - RCM Claims Management (Create, Batch, FRP, Rebill)

### Tag Usage Examples

```typescript
import { test, expect } from './fixtures';

// Multiple tags for comprehensive tracking
test('create encounter note with valid patient data @smoke @functional @ai-generated @critical @treatment-encounter-notes', 
  async ({ page }) => {
    // This test helps track:
    // - AI-generated test quality
    // - Smoke test coverage
    // - Critical path coverage
    // - Feature-specific metrics
  }
);

test('verify patient search filters @regression @functional @manual-conversion @medium @patient-intake', 
  async ({ page }) => {
    // Tracks converted manual tests
  }
);

test('encounter note API validation @api @regression @traditional @high @treatment-encounter-notes', 
  async ({ request }) => {
    // Traditional API test
  }
);

test('patient registration performance @performance @non-functional @regression @patient-intake', 
  async ({ page }) => {
    // Performance testing
  }
);

// RCM Direct Billing Examples
test('search patient with multiple filters @smoke @functional @critical @rcm @patients', 
  async ({ page }) => {
    // RCM patient search with filters
  }
);

test('post charges batch process @e2e @functional @regression @rcm @revenue', 
  async ({ page }) => {
    // RCM revenue management - post charges
  }
);

test('create claims with validation @smoke @functional @critical @rcm @claims', 
  async ({ page }) => {
    // RCM claims creation workflow
  }
);
```

### Running Tagged Tests

```bash
# Run smoke tests only
npx playwright test --grep @smoke

# Run regression tests (exclude smoke)
npx playwright test --grep @regression --grep-invert @smoke

# Run AI-generated tests
npx playwright test --grep @ai-generated

# Run specific feature tests
npx playwright test --grep @treatment-encounter-notes

# Run critical tests
npx playwright test --grep @critical

# Combine multiple tags (AND logic)
npx playwright test --grep "(?=.*@smoke)(?=.*@critical)"

# Run by project (defined in playwright.config.ts)
npx playwright test --project=smoke
npx playwright test --project=ai-generated

# Run RCM Direct Billing tests
npx playwright test --grep @rcm
npx playwright test tests/rcm/

# Run specific RCM modules
npx playwright test --grep @patients
npx playwright test --grep @revenue
npx playwright test --grep @claims

# Run RCM smoke tests
npx playwright test --grep "(?=.*@rcm)(?=.*@smoke)"

# Run RCM E2E workflows
npx playwright test tests/rcm/e2e-workflows.spec.ts
```

---

## Page Object Pattern (Hybrid Approach)

We use a **hybrid approach** combining Page Objects with inline locators for maintainability.

### Base Page

Create `pages/base.page.ts`:

```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click element with automatic waiting
   */
  async clickElement(locator: Locator) {
    await this.waitForElement(locator);
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, text: string) {
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  /**
   * Get text content
   */
  async getTextContent(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(urlPattern?: string) {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern);
    }
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Example Page Object

Create `pages/login.page.ts`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators
  private get usernameInput() {
    return this.page.getByLabel('Username');
  }

  private get passwordInput() {
    return this.page.getByLabel('Password');
  }

  private get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  private get errorMessage() {
    return this.page.getByRole('alert');
  }

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto('/login');
  }

  /**
   * Perform login
   */
  async login(username: string, password: string) {
    await this.navigateToLogin();
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.loginButton);
    await this.waitForNavigation('**/dashboard');
  }

  /**
   * Verify login error message
   */
  async verifyErrorMessage(expectedMessage: string) {
    const actualMessage = await this.getTextContent(this.errorMessage);
    return actualMessage.includes(expectedMessage);
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled() {
    return await this.loginButton.isEnabled();
  }
}
```

### Hybrid Approach in Tests

You can use both Page Objects and inline locators:

```typescript
import { test, expect } from './fixtures';
import { LoginPage } from './pages/login.page';

test('login with valid credentials @smoke @functional', async ({ page }) => {
  // Using Page Object
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password123');
  
  // Using inline locators for simple interactions
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('verify navigation menu items @smoke', async ({ page }) => {
  // Direct locators for quick tests
  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: 'Patients' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Encounters' })).toBeVisible();
});
```

---

## Sample Test Structure

### Seed Test (tests/seed.spec.ts)

```typescript
/**
 * Seed test for Playwright Agents
 * This test sets up the environment and serves as an example for agent-generated tests
 */
import { test, expect } from '../fixtures';

test('seed - setup authenticated session @setup', async ({ page }) => {
  // This test uses the saved authentication state
  await page.goto('/dashboard');
  
  // Verify successful authentication
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  
  // Verify user is logged in
  await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible();
});
```

### UI Test Examples

#### Example 1: Treatment Encounter Notes

Create `tests/treatment-encounter-notes/create-encounter-note.spec.ts`:

```typescript
import { test, expect } from '../../fixtures';
import { EncounterNotePage } from '../../pages/treatment-encounter/encounter-note.page';

test.describe('Treatment Encounter Notes - Creation @treatment-encounter-notes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to encounter notes section
    await page.goto('/encounters/notes');
    await page.waitForLoadState('networkidle');
  });

  test('create encounter note with valid patient data @smoke @functional @critical @ai-generated', 
    async ({ page, patientData, encounterData }) => {
      await test.step('Navigate to create encounter note form', async () => {
        await page.getByRole('button', { name: 'New Encounter Note' }).click();
        await expect(page.getByRole('heading', { name: 'Create Encounter Note' })).toBeVisible();
      });

      await test.step('Select patient', async () => {
        await page.getByLabel('Patient Search').fill(patientData.mrn);
        await page.getByRole('option', { name: patientData.firstName }).click();
      });

      await test.step('Fill encounter details', async () => {
        await page.getByLabel('Chief Complaint').fill(encounterData.chiefComplaint);
        await page.getByLabel('Diagnosis').fill(encounterData.diagnosis);
        await page.getByLabel('Treatment Plan').fill(encounterData.treatment);
      });

      await test.step('Save encounter note', async () => {
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Encounter note saved successfully')).toBeVisible();
      });

      await test.step('Verify encounter note appears in list', async () => {
        await page.getByRole('link', { name: 'Encounter Notes List' }).click();
        await expect(page.getByText(encounterData.chiefComplaint)).toBeVisible();
      });
    }
  );

  test('validate required fields on encounter note creation @regression @functional @validation', 
    async ({ page }) => {
      await page.getByRole('button', { name: 'New Encounter Note' }).click();
      
      // Try to save without filling required fields
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify validation messages
      await expect(page.getByText('Patient is required')).toBeVisible();
      await expect(page.getByText('Chief Complaint is required')).toBeVisible();
      await expect(page.getByText('Diagnosis is required')).toBeVisible();
    }
  );

  test('cancel encounter note creation @regression @functional', async ({ page }) => {
    await page.getByRole('button', { name: 'New Encounter Note' }).click();
    await page.getByLabel('Chief Complaint').fill('Test data');
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify confirmation dialog
    await expect(page.getByText('Discard unsaved changes?')).toBeVisible();
    await page.getByRole('button', { name: 'Yes, discard' }).click();
    
    // Verify returned to list
    await expect(page.getByRole('heading', { name: 'Encounter Notes' })).toBeVisible();
  });
});
```

#### Example 2: RCM Direct Billing - Revenue Management (Post Charges)

Create `tests/rcm/revenue-post-charges.spec.ts`:

```typescript
import { test, expect } from '../../fixtures';
import { RevenuePage } from '../../pages/rcm/revenue.page';

test.describe('RCM Revenue Management - Post Charges @rcm @revenue', () => {
  let revenuePage: RevenuePage;

  test.beforeEach(async ({ page }) => {
    revenuePage = new RevenuePage(page);
    await page.goto('/Financials#revenue/revenue');
    await page.waitForLoadState('networkidle');
  });

  test('post charges for single patient service @smoke @functional @critical', 
    async ({ page }) => {
      await test.step('Navigate to Post Charges tab', async () => {
        await page.getByRole('tab', { name: 'Post charges' }).click();
        await expect(page.getByRole('heading', { name: 'Post charges' })).toBeVisible();
      });

      await test.step('Set service date range', async () => {
        await page.getByLabel('Services From').fill('11/01/2025');
        await page.getByLabel('Services Through').fill('11/22/2025');
      });

      await test.step('Select division and entity', async () => {
        await page.getByLabel('Division').selectOption('RAM DB Clinic');
        await page.getByLabel('Entity').selectOption('RAM DB Clinic Entity');
      });

      await test.step('Click Start to load charges', async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        await page.waitForLoadState('networkidle');
        
        // Verify charges are loaded
        await expect(page.getByText(/Services through.*for/)).toBeVisible();
      });

      await test.step('Verify charges to post count', async () => {
        const chargesText = await page.getByText(/Charges to post:/).textContent();
        expect(chargesText).toMatch(/Charges to post: \d+/);
      });

      await test.step('View charge details', async () => {
        // Click on first charge row to expand details
        await page.locator('table tbody tr').first().click();
        
        // Verify charge details are visible
        await expect(page.getByText('Requested By')).toBeVisible();
        await expect(page.getByText('Requested On')).toBeVisible();
      });
    }
  );

  test('post charges with job limit configuration @regression @functional', 
    async ({ page }) => {
      await page.getByRole('tab', { name: 'Post charges' }).click();
      await page.getByLabel('Services From').fill('11/01/2025');
      await page.getByLabel('Services Through').fill('11/22/2025');
      
      await test.step('Configure job limit', async () => {
        await page.getByLabel('Job Limit:').selectOption('50');
      });

      await test.step('Start charge posting process', async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        await page.waitForLoadState('networkidle');
        
        // Verify limited results
        const rows = await page.locator('table tbody tr').count();
        expect(rows).toBeLessThanOrEqual(50);
      });
    }
  );

  test('verify batch job status @e2e @functional', async ({ page }) => {
    await page.getByRole('tab', { name: 'Post charges' }).click();
    await page.getByLabel('Services Through').fill('11/22/2025');
    await page.getByRole('button', { name: 'Start' }).click();
    
    await test.step('Check for running batch job', async () => {
      // Look for batch job status indicator
      const batchStatus = page.getByText(/Running in a batch job/);
      
      if (await batchStatus.isVisible()) {
        await expect(batchStatus).toBeVisible();
        console.log('Batch job is running');
      } else {
        console.log('No batch job running');
      }
    });
  });
});
```

#### Example 3: RCM Direct Billing - Claims Management (Create Claims)

Create `tests/rcm/claims-create-claims.spec.ts`:

```typescript
import { test, expect } from '../../fixtures';
import { ClaimsPage } from '../../pages/rcm/claims.page';

test.describe('RCM Claims Management - Create Claims @rcm @claims', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await page.goto('/Financials#claims/generation');
    await page.waitForLoadState('networkidle');
  });

  test('create claims for specific division and date range @smoke @functional @critical', 
    async ({ page }) => {
      await test.step('Navigate to Create Claims tab', async () => {
        await page.getByRole('tab', { name: 'Create Claims' }).click();
        await expect(page.getByRole('heading', { name: 'Create Claims' })).toBeVisible();
      });

      await test.step('Set services through date', async () => {
        await page.getByLabel('Services Through').fill('10/27/2025');
      });

      await test.step('Select division', async () => {
        await page.getByLabel('Division').selectOption('ALF Division');
      });

      await test.step('Configure claim creation options', async () => {
        // Select paying agency (optional)
        await page.getByLabel('Paying Agency').selectOption({ index: 1 });
        
        // Select payer plan (optional)
        await page.getByLabel('Plan').selectOption({ index: 1 });
      });

      await test.step('Set validation requirements', async () => {
        // Check validation checkboxes
        await page.getByLabel('Require month-end close to bill for services').check();
        await page.getByLabel('Require all charges for customer to be posted before creating claim').check();
      });

      await test.step('Start claim creation process', async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        await page.waitForLoadState('networkidle');
        
        // Wait for claim batch jobs to be generated
        await expect(page.getByText(/Generated Claim batch Jobs|Claim Creation Jobs/)).toBeVisible({ timeout: 15000 });
      });

      await test.step('Verify claim batch jobs created', async () => {
        // Check for job status table
        await expect(page.getByText('Description')).toBeVisible();
        await expect(page.getByText('Requested By')).toBeVisible();
        await expect(page.getByText('Requested On')).toBeVisible();
        await expect(page.getByText('Status')).toBeVisible();
      });

      await test.step('Verify claim statistics', async () => {
        // Look for claim statistics in results
        const cleanClaims = page.getByText(/Clean claims: \d+/);
        const warnings = page.getByText(/warnings: \d+/);
        const errors = page.getByText(/errors: \d+/);
        
        if (await cleanClaims.isVisible()) {
          await expect(cleanClaims).toBeVisible();
          console.log('Clean claims count found');
        }
      });
    }
  );

  test('create claims for multiple entities @regression @functional', 
    async ({ page }) => {
      await page.getByRole('tab', { name: 'Create Claims' }).click();
      
      await test.step('Select All Entities option', async () => {
        await page.getByLabel('Services Through').fill('10/27/2025');
        await page.getByLabel('Division').selectOption('All Entities');
      });

      await test.step('Start claim creation', async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        await page.waitForLoadState('networkidle');
      });

      await test.step('Verify multiple batch jobs created', async () => {
        // Multiple jobs should be created for different entities
        const jobRows = await page.locator('table tbody tr').count();
        expect(jobRows).toBeGreaterThan(0);
      });
    }
  );

  test('view claim batch job details @regression @functional', 
    async ({ page }) => {
      await page.getByRole('tab', { name: 'Create Claims' }).click();
      await page.getByLabel('Services Through').fill('10/27/2025');
      await page.getByRole('button', { name: 'Start' }).click();
      await page.waitForLoadState('networkidle');
      
      await test.step('Click on batch job to view details', async () => {
        // Click on first job in the results
        const firstJobRow = page.locator('table tbody tr').first();
        await firstJobRow.locator('td').first().click();
        
        // Verify job details are expanded/displayed
        await expect(page.getByText(/Clean claims:|errors:|warnings:/)).toBeVisible();
      });
    }
  );

  test('validate required fields for claim creation @regression @functional @validation', 
    async ({ page }) => {
      await page.getByRole('tab', { name: 'Create Claims' }).click();
      
      await test.step('Attempt to start without required fields', async () => {
        // Clear services through date
        await page.getByLabel('Services Through').clear();
        
        // Try to start
        await page.getByRole('button', { name: 'Start' }).click();
      });

      await test.step('Verify validation messages', async () => {
        // Check for error message or disabled state
        // This depends on your application's validation behavior
        await expect(page.getByLabel('Services Through')).toBeFocused();
      });
    }
  );

  test('set job limit for claim creation @regression @functional', 
    async ({ page }) => {
      await page.getByRole('tab', { name: 'Create Claims' }).click();
      
      await test.step('Configure job limit', async () => {
        await page.getByLabel('Services Through').fill('10/27/2025');
        await page.getByLabel('Job Limit:').selectOption('25');
      });

      await test.step('Start with limited jobs', async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        await page.waitForLoadState('networkidle');
        
        // Verify limited number of jobs created
        const jobCount = await page.locator('table tbody tr').count();
        expect(jobCount).toBeLessThanOrEqual(25);
      });
    }
  );
});
```

#### Example 4: RCM Direct Billing - Patient Search with Filters

Create `tests/rcm/patient-search.spec.ts`:

```typescript
import { test, expect } from '../../fixtures';
import { PatientSearchPage } from '../../pages/rcm/patient-search.page';

test.describe('RCM Patient Search and Reconciliation @rcm @patients', () => {
  let patientSearchPage: PatientSearchPage;

  test.beforeEach(async ({ page }) => {
    patientSearchPage = new PatientSearchPage(page);
    await page.goto('/Patients');
    await page.waitForLoadState('networkidle');
  });

  test('search patient with multiple filters @smoke @functional @critical', 
    async ({ page }) => {
      await test.step('Enter search criteria', async () => {
        await page.getByLabel('First Name').fill('John');
        await page.getByLabel('Last Name').fill('Doe');
        await page.getByLabel('Date of Birth').fill('01/15/1980');
      });

      await test.step('Execute search', async () => {
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
      });

      await test.step('Verify search results', async () => {
        await expect(page.getByText('John Doe')).toBeVisible();
        await expect(page.locator('table tbody tr')).toHaveCount(1);
      });
    }
  );

  test('search patient by MRN @smoke @functional', async ({ page }) => {
    await test.step('Search by MRN', async () => {
      await page.getByLabel('MRN').fill('MRN-123456');
      await page.getByRole('button', { name: 'Search' }).click();
    });

    await test.step('Verify patient found', async () => {
      await expect(page.getByText('MRN-123456')).toBeVisible();
    });
  });

  test('clear search filters @regression @functional', async ({ page }) => {
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('Patient');
    
    await test.step('Click clear button', async () => {
      await page.getByRole('button', { name: 'Clear' }).click();
    });

    await test.step('Verify filters are cleared', async () => {
      await expect(page.getByLabel('First Name')).toHaveValue('');
      await expect(page.getByLabel('Last Name')).toHaveValue('');
    });
  });
});
```

---

## API Testing Setup

### REST API Test Example

Create `tests/api/rest/patient-api.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const ENV = process.env.ENV || 'dev';
const envConfig = require(`../../../config/${ENV}.config`).default;

test.describe('Patient API Tests @api @patient-intake', () => {
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
        username: envConfig.users.clinician.username,
        password: envConfig.users.clinician.password,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    authToken = body.token;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('create patient via API @smoke @api @functional', async () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1980-01-15',
      gender: 'Male',
      mrn: `MRN-${Date.now()}`,
    };

    const response = await apiContext.post('/api/v1/patients', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: patientData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.firstName).toBe(patientData.firstName);
    expect(body.lastName).toBe(patientData.lastName);
  });

  test('get patient by ID @regression @api @functional', async () => {
    // Create patient first
    const createResponse = await apiContext.post('/api/v1/patients', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        dob: '1992-05-22',
        gender: 'Female',
        mrn: `MRN-${Date.now()}`,
      },
    });

    const createdPatient = await createResponse.json();

    // Get patient by ID
    const getResponse = await apiContext.get(`/api/v1/patients/${createdPatient.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(getResponse.ok()).toBeTruthy();
    const patient = await getResponse.json();
    expect(patient.id).toBe(createdPatient.id);
    expect(patient.firstName).toBe('Jane');
  });

  test('update patient demographics @regression @api @functional', async () => {
    // Create patient
    const createResponse = await apiContext.post('/api/v1/patients', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        firstName: 'Bob',
        lastName: 'Johnson',
        dob: '1975-08-10',
        gender: 'Male',
        mrn: `MRN-${Date.now()}`,
      },
    });

    const patient = await createResponse.json();

    // Update patient
    const updateResponse = await apiContext.put(`/api/v1/patients/${patient.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        firstName: 'Robert',
        lastName: 'Johnson',
      },
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updatedPatient = await updateResponse.json();
    expect(updatedPatient.firstName).toBe('Robert');
  });

  test('search patients by criteria @regression @api @functional', async () => {
    const response = await apiContext.get('/api/v1/patients/search', {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        lastName: 'Smith',
        limit: 10,
      },
    });

    expect(response.ok()).toBeTruthy();
    const results = await response.json();
    expect(Array.isArray(results.patients)).toBeTruthy();
    expect(results.patients.length).toBeGreaterThan(0);
  });

  test('handle invalid patient data @regression @api @validation', async () => {
    const invalidData = {
      firstName: '', // Empty required field
      lastName: 'Doe',
    };

    const response = await apiContext.post('/api/v1/patients', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: invalidData,
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('message');
    expect(error.message).toContain('firstName is required');
  });
});
```

### GraphQL API Test Example

Create `tests/api/graphql/encounter-api.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const ENV = process.env.ENV || 'dev';
const envConfig = require(`../../../config/${ENV}.config`).default;

test.describe('Encounter GraphQL API Tests @api @treatment-encounter-notes', () => {
  let apiContext: any;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: envConfig.apiURL,
    });

    // Authenticate
    const response = await apiContext.post('/auth/login', {
      data: {
        username: envConfig.users.clinician.username,
        password: envConfig.users.clinician.password,
      },
    });

    const body = await response.json();
    authToken = body.token;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('query encounters by patient ID @smoke @api @functional', async () => {
    const query = `
      query GetEncounters($patientId: ID!) {
        encounters(patientId: $patientId) {
          id
          date
          chiefComplaint
          diagnosis
          provider {
            name
          }
        }
      }
    `;

    const response = await apiContext.post('/graphql', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        query,
        variables: { patientId: '123' },
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.data).toHaveProperty('encounters');
    expect(Array.isArray(result.data.encounters)).toBeTruthy();
  });

  test('create encounter via GraphQL mutation @regression @api @functional', async () => {
    const mutation = `
      mutation CreateEncounter($input: EncounterInput!) {
        createEncounter(input: $input) {
          id
          date
          chiefComplaint
          diagnosis
        }
      }
    `;

    const input = {
      patientId: '123',
      date: new Date().toISOString(),
      chiefComplaint: 'Routine follow-up',
      diagnosis: 'Type 2 Diabetes Mellitus',
      treatment: 'Continue current medication',
    };

    const response = await apiContext.post('/graphql', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        query: mutation,
        variables: { input },
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.data.createEncounter).toHaveProperty('id');
    expect(result.data.createEncounter.chiefComplaint).toBe(input.chiefComplaint);
  });
});
```

---

## Best Practices

### 1. Locator Strategy

**Priority Order** (Best to Worst):
1. **Role-based locators** (Recommended)
   ```typescript
   page.getByRole('button', { name: 'Save' })
   page.getByRole('textbox', { name: 'Username' })
   ```

2. **Label-based locators**
   ```typescript
   page.getByLabel('Email Address')
   ```

3. **Test IDs** (For stability)
   ```typescript
   page.getByTestId('submit-button')
   ```

4. **Text-based locators**
   ```typescript
   page.getByText('Welcome')
   ```

5. **CSS/XPath** (Last resort)
   ```typescript
   page.locator('[data-automation-id="header"]')
   ```

### 2. Test Independence

✅ **Good**: Each test is self-contained
```typescript
test('create patient @smoke', async ({ page }) => {
  // Setup
  const patient = TestDataGenerator.generatePatient();
  
  // Test
  await createPatient(page, patient);
  
  // Verify
  await expect(page.getByText(patient.firstName)).toBeVisible();
  
  // Cleanup (if needed)
  await deletePatient(page, patient.id);
});
```

❌ **Bad**: Tests depend on each other
```typescript
let patientId: string;

test('create patient', async ({ page }) => {
  patientId = await createPatient(page);
});

test('edit patient', async ({ page }) => {
  // Depends on previous test!
  await editPatient(page, patientId);
});
```

### 3. Use test.step() for Clarity

```typescript
test('complete patient workflow @e2e', async ({ page }) => {
  await test.step('Create new patient', async () => {
    await page.goto('/patients/new');
    // ... patient creation steps
  });

  await test.step('Schedule appointment', async () => {
    await page.goto('/appointments/new');
    // ... appointment steps
  });

  await test.step('Verify patient dashboard', async () => {
    await page.goto('/dashboard');
    // ... verification steps
  });
});
```

### 4. Waiting Strategies

✅ **Good**: Auto-waiting with assertions
```typescript
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await expect(page.getByText('Success')).toBeVisible();
```

❌ **Bad**: Hard-coded waits
```typescript
await page.waitForTimeout(5000); // Avoid this!
```

### 5. Error Handling

```typescript
test('handle API errors gracefully @regression', async ({ page }) => {
  // Simulate network error
  await page.route('**/api/patients', route => route.abort());
  
  await page.getByRole('button', { name: 'Load Patients' }).click();
  
  // Verify error message
  await expect(page.getByText('Failed to load patients')).toBeVisible();
});
```

### 6. Parallel Execution

Tests run in parallel by default. Use `test.describe.serial()` when needed:

```typescript
test.describe.serial('Sequential workflow', () => {
  test('step 1', async ({ page }) => {
    // Runs first
  });
  
  test('step 2', async ({ page }) => {
    // Runs after step 1
  });
});
```

### 7. Annotations and Metadata

```typescript
test('flaky test @regression', async ({ page }) => {
  test.info().annotations.push({ type: 'issue', description: 'JIRA-1234' });
  test.skip(process.env.ENV === 'prod', 'Skip in production');
  
  // Test implementation
});
```

### 8. Custom Matchers

Create reusable assertions in `utils/custom-matchers.ts`:

```typescript
import { expect } from '@playwright/test';

expect.extend({
  async toHaveValidationError(locator, expectedMessage) {
    const errorElement = locator.locator('[role="alert"]');
    const text = await errorElement.textContent();
    
    return {
      pass: text?.includes(expectedMessage) ?? false,
      message: () => `Expected validation error: ${expectedMessage}`,
    };
  },
});
```

### 9. Screenshot on Failure (Automatic)

Already configured in `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```

### 10. Performance Testing

```typescript
test('measure page load performance @performance', async ({ page }) => {
  await page.goto('/dashboard');
  
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  
  const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

---

## Azure DevOps CI/CD Integration

### Azure Pipeline YAML

Create `azure-pipelines.yml`:

```yaml
# Playwright Test Pipeline for Net Health Applications
# Supports multiple environments and test types

trigger:
  branches:
    include:
      - main
      - develop
      - release/*

pr:
  branches:
    include:
      - main
      - develop

variables:
  NODE_VERSION: '18.x'
  PLAYWRIGHT_VERSION: 'latest'

stages:
  # ============================================
  # Stage 1: Quick Validation (Smoke Tests)
  # ============================================
  - stage: QuickValidation
    displayName: 'Quick Validation - Smoke Tests'
    jobs:
      - job: SmokeTests
        displayName: 'Run Smoke Tests'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            displayName: 'Install Node.js'
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: |
              npm ci
            displayName: 'Install Dependencies'

          - script: |
              npx playwright install --with-deps
            displayName: 'Install Playwright Browsers'

          - script: |
              npx playwright test --grep @smoke --reporter=html,junit
            displayName: 'Run Smoke Tests (5-10 min)'
            env:
              ENV: dev
              CI: true

          - task: PublishTestResults@2
            displayName: 'Publish Smoke Test Results'
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'Smoke Tests - $(Build.SourceBranchName)'

          - task: PublishPipelineArtifact@1
            displayName: 'Publish HTML Report'
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'smoke-test-report'

  # ============================================
  # Stage 2: Comprehensive Validation
  # ============================================
  - stage: ComprehensiveValidation
    displayName: 'Comprehensive Validation - Full Test Suite'
    dependsOn: QuickValidation
    condition: succeeded()
    
    jobs:
      # Regression Tests
      - job: RegressionTests
        displayName: 'Run Regression Tests'
        pool:
          vmImage: 'ubuntu-latest'
        timeoutInMinutes: 60
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install Browsers'

          - script: |
              npx playwright test --grep @regression --grep-invert @smoke --reporter=html,junit
            displayName: 'Run Regression Tests'
            env:
              ENV: dev
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'Regression Tests'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'regression-test-report'

      # AI-Generated Tests (For Metrics Tracking)
      - job: AIGeneratedTests
        displayName: 'Run AI-Generated Tests'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install Browsers'

          - script: |
              npx playwright test --grep @ai-generated --reporter=html,junit
            displayName: 'Run AI-Generated Tests'
            env:
              ENV: dev
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'AI-Generated Tests'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'ai-generated-test-report'

      # API Tests
      - job: APITests
        displayName: 'Run API Tests'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: |
              npx playwright test --grep @api --reporter=html,junit
            displayName: 'Run API Tests'
            env:
              ENV: dev
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'API Tests'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'api-test-report'

  # ============================================
  # Stage 3: Staging Environment Tests
  # ============================================
  - stage: StagingValidation
    displayName: 'Staging Environment Validation'
    dependsOn: ComprehensiveValidation
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    
    jobs:
      - job: StagingTests
        displayName: 'Run Tests on Staging'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install Browsers'

          - script: |
              npx playwright test --grep "@smoke|@critical" --reporter=html,junit
            displayName: 'Run Critical Tests on Staging'
            env:
              ENV: staging
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'Staging Tests'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'staging-test-report'

  # ============================================
  # Stage 4: Production Smoke Tests (Optional)
  # ============================================
  - stage: ProductionSmoke
    displayName: 'Production Smoke Tests'
    dependsOn: StagingValidation
    condition: |
      and(
        succeeded(),
        eq(variables['Build.SourceBranch'], 'refs/heads/main'),
        eq(variables['RUN_PROD_TESTS'], 'true')
      )
    
    jobs:
      - job: ProductionSmokeTests
        displayName: 'Run Production Smoke Tests'
        pool:
          vmImage: 'ubuntu-latest'
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install Browsers'

          - script: |
              npx playwright test --grep @smoke --grep @prod-safe --reporter=html,junit
            displayName: 'Run Production Smoke Tests'
            env:
              ENV: prod
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'Production Smoke Tests'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'production-test-report'
```

### Scheduled Pipeline (Nightly Runs)

Create `azure-pipelines-nightly.yml`:

```yaml
# Nightly Full Regression Suite

schedules:
  - cron: "0 2 * * *" # Run at 2 AM UTC daily
    displayName: 'Nightly Regression'
    branches:
      include:
        - main
    always: true

trigger: none
pr: none

variables:
  NODE_VERSION: '18.x'

stages:
  - stage: NightlyRegression
    displayName: 'Nightly Full Regression'
    jobs:
      - job: FullRegressionSuite
        displayName: 'Run Complete Test Suite'
        pool:
          vmImage: 'ubuntu-latest'
        timeoutInMinutes: 120
        
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(NODE_VERSION)

          - script: npm ci
            displayName: 'Install Dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install Browsers'

          - script: |
              npx playwright test --reporter=html,junit
            displayName: 'Run All Tests'
            env:
              ENV: dev
              CI: true

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
              testRunTitle: 'Nightly Regression'

          - task: PublishPipelineArtifact@1
            condition: succeededOrFailed()
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'nightly-regression-report'

          # Send notification on failure
          - task: SendEmail@1
            condition: failed()
            inputs:
              To: 'qa-team@nethealth.com'
              Subject: 'Nightly Regression Failed'
              Body: 'The nightly regression test suite has failed. Please check the test report.'
```

---

## Housekeeping Rules

### 1. Git Ignore Configuration

Create `.gitignore`:

```
# Node modules
node_modules/

# Test results
test-results/
playwright-report/
playwright/.cache/
screenshots/

# Environment variables
.env

# Authentication states (contains sensitive data)
auth/*.json
!auth/.gitkeep

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
```

### 2. Code Review Checklist

Before merging test code:

- [ ] Test names are descriptive and include appropriate tags
- [ ] Tests are independent and can run in any order
- [ ] No hard-coded waits (use auto-waiting)
- [ ] Proper use of locators (prefer role-based)
- [ ] Test data is parameterized or generated
- [ ] Error scenarios are covered
- [ ] Tests pass consistently (3+ runs)
- [ ] No sensitive data in code (use .env)
- [ ] Comments explain "why", not "what"
- [ ] Follows naming conventions

### 3. Maintenance Guidelines

#### Weekly Tasks:
- Review and update flaky tests
- Clean up obsolete test data
- Update test documentation

#### Monthly Tasks:
- Review test coverage metrics
- Update dependencies: `npm update`
- Re-generate Playwright Agents: `npx playwright init-agents`
- Archive old test reports

#### Quarterly Tasks:
- Review and refactor test structure
- Update baseline screenshots (if using visual testing)
- Conduct test framework retrospective

### 4. Test Data Cleanup

Add cleanup hooks:

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data created during test
  // This prevents data pollution
});

test.afterAll(async () => {
  // Clean up shared test data
});
```

### 5. Dependency Management

Keep dependencies updated:

```bash
# Check for outdated packages
npm outdated

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# Update all dependencies (carefully!)
npm update

# Regenerate Playwright Agents after updates
npx playwright init-agents --loop=vscode
```

### 6. Documentation Standards

Every test file should include:

```typescript
/**
 * @feature Treatment Encounter Notes
 * @module Create Encounter Note
 * @description Tests for creating treatment encounter notes
 * @tags @treatment-encounter-notes @functional
 */

import { test, expect } from '../../fixtures';

// Test implementation...
```

---

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/path/to/test.spec.ts

# Run tests by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression

# Run tests by project
npx playwright test --project=chromium
npx playwright test --project=smoke

# Run specific test by name
npx playwright test -g "create encounter note"

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with UI mode (interactive)
npx playwright test --ui

# Run on specific environment
ENV=staging npx playwright test --grep @smoke
```

### Using Playwright Agents

#### 1. Generate Test Plan (🎭 Planner)

```bash
# Using VS Code with Playwright extension
# Or Claude Code
claude: "Generate a test plan for patient registration flow. Use tests/seed.spec.ts as the seed."

# Planner will:
# - Explore the application
# - Generate specs/patient-registration.md
```

#### 2. Generate Tests (🎭 Generator)

```bash
claude: "Generate Playwright tests from specs/patient-registration.md"

# Generator will:
# - Read the test plan
# - Create tests/patient-registration.spec.ts
# - Verify selectors live
```

#### 3. Heal Failing Tests (🎭 Healer)

```bash
claude: "Heal the failing test: create-encounter-note.spec.ts"

# Healer will:
# - Replay failing steps
# - Inspect current UI
# - Update locators
# - Re-run until passing
```

### View Test Reports

```bash
# Open HTML report
npx playwright show-report

# The report opens in browser with:
# - Test results
# - Screenshots
# - Videos
# - Traces
```

### CI/CD Commands

```bash
# Run in CI mode (no interactive features)
CI=true npx playwright test

# Generate reports for Azure DevOps
npx playwright test --reporter=junit,html,json
```

---

## Troubleshooting

### Common Issues

#### Issue: Tests fail with "element not found"

**Solution**:
```typescript
// Add explicit wait
await page.waitForLoadState('networkidle');

// Use better locator
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
```

#### Issue: Authentication state not working

**Solution**:
```bash
# Regenerate auth files
npm run test:setup

# Or manually
npx playwright test global-setup.ts
```

#### Issue: Tests pass locally but fail in CI

**Solution**:
```typescript
// Check for timing issues
test.setTimeout(60000); // Increase timeout

// Check for viewport issues
use: {
  viewport: { width: 1920, height: 1080 },
}
```

#### Issue: Playwright Agents not working

**Solution**:
```bash
# Re-initialize agents
npx playwright init-agents --loop=vscode

# Make sure to update agents after Playwright updates
```

---

## Additional Resources

### Official Documentation
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Agents](https://playwright.dev/docs/test-agents)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

### Internal Resources
- Confluence: Net Health QE Best Practices
- Azure DevOps: Test Automation Project
- Slack: #qa-automation channel

### Useful Commands Cheat Sheet

```bash
# Installation
npm install -D @playwright/test
npx playwright install
npx playwright init-agents --loop=vscode

# Running tests
npx playwright test                    # All tests
npx playwright test --grep @smoke      # Tagged tests
npx playwright test --project=chromium # Specific browser
npx playwright test --ui               # UI mode
npx playwright test --debug            # Debug mode
npx playwright test --headed           # See browser

# Reports
npx playwright show-report             # View HTML report

# Code generation
npx playwright codegen <url>           # Record actions

# Update browsers
npx playwright install                 # Update all browsers
```

---

## Appendix

### A. package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression --grep-invert @smoke",
    "test:api": "playwright test --grep @api",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:chromium": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:webkit": "playwright test --project=webkit",
    "test:dev": "ENV=dev playwright test",
    "test:staging": "ENV=staging playwright test",
    "test:prod": "ENV=prod playwright test --grep @prod-safe",
    "report": "playwright show-report",
    "codegen": "playwright codegen",
    "install:browsers": "playwright install --with-deps",
    "init:agents": "playwright init-agents --loop=vscode"
  }
}
```

### B. VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/test-results": true,
    "**/playwright-report": true
  }
}
```

### C. ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'playwright/no-wait-for-timeout': 'error',
    'playwright/no-element-handle': 'warn',
  },
};
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2025 | Initial framework setup guide | QE Team |

---

## Feedback and Improvements

This framework guide is a living document. Please submit suggestions and improvements via:
- Azure DevOps Work Items
- Slack #qa-automation channel
- Direct feedback to QE Team Lead

---

**Remember**: The goal is to create maintainable, reliable, and scalable test automation that supports both traditional development and AI-powered test generation. Always prioritize test quality and clarity over quantity!
