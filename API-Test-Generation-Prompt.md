# AI Prompt: Generate API Test Specs and Playwright Automated Tests

## Context
You are an expert test automation engineer specializing in API testing with Playwright. Your task is to analyze a codebase, identify all API endpoints, and generate comprehensive test specifications and automated tests following Net Health's standardized Playwright framework.

## Framework Standards Reference
This codebase uses the Net Health Playwright Framework with these key characteristics:
- **Language**: TypeScript
- **Test Runner**: Playwright Test (@playwright/test)
- **Architecture**: Hybrid Page Object Model (component objects + helper functions)
- **Authentication**: Stored state in `playwright/.auth/` directory
- **Reporting**: HTML reports with screenshots/traces on failure
- **Test Organization**: Tag-based with @smoke, @regression, @api, @ai-generated tags
- **Data Management**: JSON files with environment-specific configs
- **API Support**: Both REST and GraphQL endpoints

## Your Multi-Phase Task

### Phase 1: Codebase Analysis and API Discovery

**Analyze the following directories/files to identify all API endpoints:**
- Backend controller files (e.g., `*Controller.ts`, `*Controller.cs`, `*Routes.ts`)
- API route definitions (e.g., `routes/`, `api/`, `controllers/`)
- OpenAPI/Swagger specifications (if available)
- GraphQL schema files (e.g., `schema.graphql`, `*.graphql`)
- API client files (e.g., `*Client.ts`, `*Service.ts`, `api-client/`)
- Environment configuration files for base URLs

**For Each API Endpoint Discovered, Document:**
1. **Endpoint Path**: Full URL path (e.g., `/api/v1/patients`)
2. **HTTP Method**: GET, POST, PUT, PATCH, DELETE, etc.
3. **Authentication Required**: Yes/No, type (Bearer token, API key, OAuth, etc.)
4. **Request Headers**: Required and optional headers with data types
5. **Path Parameters**: Parameter name, data type, required/optional, validation rules
6. **Query Parameters**: Parameter name, data type, required/optional, default values
7. **Request Body**: Complete schema with data types, required fields, nested objects
8. **Response Codes**: All possible status codes (200, 201, 400, 401, 404, 500, etc.)
9. **Response Body**: Complete schema for each status code
10. **Business Logic**: Brief description of what the endpoint does
11. **Dependencies**: Other endpoints or services this endpoint depends on
12. **Rate Limiting**: Any rate limiting or throttling information
13. **Healthcare-Specific**: PHI/PII data handling, HIPAA compliance considerations

**Output Format for Phase 1:**
Create a comprehensive API inventory in markdown format:

```markdown
# API Inventory - [Application Name]

## Summary
- Total Endpoints: [count]
- REST Endpoints: [count]
- GraphQL Endpoints: [count]
- Authentication Methods: [list]
- Base URLs: 
  - DEV: [url]
  - Staging: [url]
  - PROD: [url]

## REST APIs

### 1. [Endpoint Name/Purpose]
- **Path**: `/api/v1/resource`
- **Method**: POST
- **Authentication**: Bearer Token (Azure B2C)
- **Description**: [Brief description of functionality]
- **Request Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}",
    "X-Correlation-Id": "string (optional)"
  }
  ```
- **Path Parameters**: None
- **Query Parameters**:
  - `includeDeleted` (boolean, optional, default: false)
  - `limit` (integer, optional, default: 50, max: 200)
- **Request Body**:
  ```json
  {
    "field1": "string (required, max 100 chars)",
    "field2": {
      "nestedField": "integer (required, min: 1)"
    }
  }
  ```
- **Response Codes**:
  - `201`: Created successfully
  - `400`: Bad request - validation error
  - `401`: Unauthorized - invalid/missing token
  - `409`: Conflict - resource already exists
  - `500`: Internal server error
- **Success Response (201)**:
  ```json
  {
    "id": "string (UUID)",
    "field1": "string",
    "createdAt": "string (ISO 8601)",
    "createdBy": "string"
  }
  ```
- **Error Response (400)**:
  ```json
  {
    "error": "string",
    "message": "string",
    "validationErrors": [
      {
        "field": "string",
        "message": "string"
      }
    ]
  }
  ```
- **Dependencies**: Requires `GET /api/v1/users/{userId}` for user validation
- **Healthcare Context**: Handles PHI - patient demographic information
```

### Phase 2: Generate Comprehensive Test Specifications

**For each API endpoint, create test specifications covering:**

1. **Happy Path Tests** (@smoke):
   - Valid request with all required fields
   - Valid request with all required + optional fields
   - Successful authentication flow

2. **Negative Tests** (@regression):
   - Missing required fields
   - Invalid data types
   - Invalid data formats (e.g., invalid email, phone format)
   - Exceeding max length/min length constraints
   - Invalid enum values
   - Out-of-range numeric values
   - Missing authentication token
   - Expired authentication token
   - Insufficient permissions

3. **Boundary Tests** (@regression):
   - Minimum valid values
   - Maximum valid values
   - Just below minimum (invalid)
   - Just above maximum (invalid)
   - Empty strings where strings are required
   - Null values where not allowed

4. **Business Logic Tests** (@regression):
   - Resource already exists scenarios
   - Resource not found scenarios
   - State transition validations
   - Dependent resource validations
   - Cascade delete scenarios (if applicable)

5. **Security Tests** (@security):
   - Unauthorized access attempts
   - Cross-tenant data access attempts (if multi-tenant)
   - SQL injection attempts in query parameters
   - XSS attempts in text fields
   - HIPAA compliance validation for PHI fields

6. **Performance/Load Tests** (@performance):
   - Response time assertions (< 500ms for GET, < 2s for POST/PUT)
   - Concurrent request handling
   - Large payload handling

7. **Data Integrity Tests** (@regression):
   - Verify data persistence
   - Verify data relationships
   - Verify computed fields
   - Verify audit trail (createdBy, updatedBy fields)

**Output Format for Phase 2:**
```markdown
# Test Specifications - [Endpoint Name]

## Test Suite: [Endpoint] - [HTTP Method]
**Total Test Cases**: [count]
**Priority Breakdown**: [X] Critical (@smoke), [Y] High (@regression), [Z] Medium

### TS-001: Create [Resource] - Valid Request - All Required Fields (@smoke, @api, @ai-generated)
- **Objective**: Verify successful creation of [resource] with all required fields
- **Preconditions**: 
  - Valid authentication token available
  - Test user has CREATE permission
- **Test Data**:
  ```json
  {
    "field1": "valid_value_1",
    "field2": 123
  }
  ```
- **Expected Result**:
  - Status Code: 201
  - Response contains generated ID (UUID format)
  - Response contains all submitted fields
  - `createdAt` field is present and valid ISO 8601 timestamp
  - `createdBy` field matches authenticated user
- **Validation Points**:
  - Response schema matches specification
  - Response time < 2000ms
  - Database record created (if DB access available)
  
### TS-002: Create [Resource] - Missing Required Field (@regression, @api, @ai-generated)
[Similar detailed specification...]

### TS-003: Create [Resource] - Invalid Data Type (@regression, @api, @ai-generated)
[Similar detailed specification...]

[Continue for all test scenarios...]
```

### Phase 3: Generate Playwright Automated Tests

**Generate production-ready Playwright tests following these framework standards:**

**File Structure Requirements:**
```
tests/
├── api/
│   ├── [module]/
│   │   ├── [resource].spec.ts
│   │   └── [resource]-negative.spec.ts
│── helpers/
│      └── api-helper.ts
└── fixtures/
│       ├── [resource]-valid.json
│       ├── [resource]-invalid.json
│       └── auth-tokens.json
├── config/
│   ├── api.env.dev.json
│   ├── api.env.staging.json
│   └── api.env.prod.json
└── utils/
    ├── auth-setup.ts
    └── test-data-generator.ts
```

**Code Generation Requirements:**

1. **Use Playwright Test Framework**:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { request } from '@playwright/test';
   ```

2. **Include Authentication Setup**:
   ```typescript
   test.use({
     extraHTTPHeaders: {
       'Authorization': `Bearer ${process.env.API_TOKEN}`,
     },
   });
   ```

3. **Follow Test Structure**:
   ```typescript
   test.describe('[Endpoint Name] - [HTTP Method]', () => {
     
     test.beforeAll(async () => {
       // Setup: Load test data, initialize helpers
     });

     test('[Test Case Name] @smoke @api @ai-generated', async ({ request }) => {
       // Step 1: Arrange - Prepare test data with test.step()
       await test.step('Prepare test data', async () => {
         // Data preparation
       });

       // Step 2: Act - Make API request with test.step()
       await test.step('Send [METHOD] request to [endpoint]', async () => {
         // API call
       });

       // Step 3: Assert - Validate response with test.step()
       await test.step('Verify response status and body', async () => {
         // Assertions
       });

       // Step 4: Cleanup - Clean up test data with test.step()
       await test.step('Cleanup test data', async () => {
         // Cleanup
       });
     });

     test.afterAll(async () => {
       // Teardown: Clean up shared resources
     });
   });
   ```

4. **Comprehensive Assertions**:
   ```typescript
   // Status code
   expect(response.status()).toBe(201);
   
   // Response body schema validation
   const body = await response.json();
   expect(body).toHaveProperty('id');
   expect(body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
   
   // Data type validation
   expect(typeof body.field1).toBe('string');
   expect(typeof body.field2).toBe('number');
   
   // Value validation
   expect(body.field1).toBe(testData.field1);
   
   // Array validation
   expect(Array.isArray(body.items)).toBe(true);
   expect(body.items.length).toBeGreaterThan(0);
   
   // Nested object validation
   expect(body.metadata).toHaveProperty('createdAt');
   expect(new Date(body.metadata.createdAt).toString()).not.toBe('Invalid Date');
   
   // Performance validation
   expect(response.headers()['content-type']).toContain('application/json');
   ```

5. **Error Handling**:
   ```typescript
   // For negative tests
   expect(response.status()).toBe(400);
   const errorBody = await response.json();
   expect(errorBody).toHaveProperty('error');
   expect(errorBody.message).toBeTruthy();
   ```

6. **Test Data Management**:
   ```typescript
   // Load from JSON file
   import validPayload from '../fixtures/patient-valid.json';
   
   // Use dynamic data generator
   import { generatePatientData } from '../../utils/test-data-generator';
   const testData = generatePatientData({ includeOptional: true });
   ```

7. **Reusable API Helper Functions**:
   ```typescript
   // tests/api/helpers/api-helper.ts
   export class ApiHelper {
     async createResource(request: APIRequestContext, payload: any) {
       const response = await request.post('/api/v1/resource', {
         data: payload,
       });
       return { response, body: await response.json() };
     }

     async getResourceById(request: APIRequestContext, id: string) {
       const response = await request.get(`/api/v1/resource/${id}`);
       return { response, body: await response.json() };
     }

     async deleteResource(request: APIRequestContext, id: string) {
       await request.delete(`/api/v1/resource/${id}`);
     }
   }
   ```

8. **Test Tagging** (CRITICAL):
   - Every test MUST include: `@api`
   - Every test MUST include: `@ai-generated` (since generated by AI)
   - Add priority tags: `@smoke` for critical paths, `@regression` for comprehensive tests
   - Add domain tags: `@billing`, `@clinical-docs`, `@patient-mgmt` (based on healthcare domain)
   - Add type tags: `@positive`, `@negative`, `@boundary`, `@security`

9. **Parallel Execution Safety**:
   ```typescript
   // Generate unique test data to avoid conflicts
   const uniqueId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   const testData = {
     name: `Test Patient ${uniqueId}`,
     email: `test-${uniqueId}@example.com`
   };
   ```

10. **Healthcare-Specific Considerations**:
    ```typescript
    // PHI data handling
    test('Should mask PHI in logs', async ({ request }) => {
      await test.step('Verify PHI fields are not in logs', async () => {
        // Test implementation
      });
    });

    // Audit trail validation
    test('Should create audit trail entry', async ({ request }) => {
      await test.step('Verify audit log contains correct information', async () => {
        // Test implementation
      });
    });
    ```

### Phase 4: Generate Test Data Fixtures

**Create JSON fixture files for:**
1. Valid payloads (minimum required fields)
2. Valid payloads (all fields including optional)
3. Invalid payloads (various error scenarios)
4. Boundary value payloads

**Example:**
```json
// fixtures/patient-valid-minimal.json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-01-15",
  "medicalRecordNumber": "MRN123456"
}

// fixtures/patient-valid-complete.json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "middleName": "Marie",
  "dateOfBirth": "1985-03-20",
  "medicalRecordNumber": "MRN789012",
  "email": "jane.smith@example.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  },
  "emergencyContact": {
    "name": "Bob Smith",
    "relationship": "Spouse",
    "phone": "+1-555-0456"
  },
  "insurance": {
    "provider": "Blue Cross",
    "policyNumber": "BC123456789",
    "groupNumber": "GRP001"
  }
}

// fixtures/patient-invalid-missing-required.json
{
  "firstName": "Invalid",
  "lastName": "Patient"
  // Missing required fields: dateOfBirth, medicalRecordNumber
}
```

### Phase 5: Generate Test Data Generator Utility

**Create a TypeScript utility for dynamic test data generation:**

```typescript
// utils/test-data-generator.ts
import { faker } from '@faker-js/faker';

export interface PatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  email?: string;
  phone?: string;
  // ... other fields
}

export function generatePatientData(options?: {
  includeOptional?: boolean;
  validEmail?: boolean;
  validPhone?: boolean;
}): PatientData {
  const uniqueId = `${Date.now()}-${faker.string.alphanumeric(6)}`;
  
  const baseData: PatientData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
    medicalRecordNumber: `MRN${uniqueId}`,
  };

  if (options?.includeOptional) {
    baseData.email = options.validEmail 
      ? `test-${uniqueId}@example.com` 
      : 'invalid-email';
    baseData.phone = options.validPhone 
      ? faker.phone.number('+1-###-###-####') 
      : '123';
  }

  return baseData;
}

export function generateInvalidPatientData(invalidField: string): Partial<PatientData> {
  switch (invalidField) {
    case 'firstName':
      return { firstName: '', lastName: 'Doe', dateOfBirth: '1980-01-01', medicalRecordNumber: 'MRN123' };
    case 'dateOfBirth':
      return { firstName: 'John', lastName: 'Doe', dateOfBirth: 'invalid-date', medicalRecordNumber: 'MRN123' };
    // Add more cases for each field
    default:
      throw new Error(`Invalid field type: ${invalidField}`);
  }
}
```

### Phase 6: Generate Configuration Files

**Create environment-specific configuration:**

```typescript
// config/env.dev.json
{
  "baseURL": "https://dev-api.nethealth.com",
  "apiVersion": "v1",
  "timeout": 30000,
  "retries": 2,
  "headers": {
    "X-Environment": "development"
  },
  "auth": {
    "tokenEndpoint": "https://dev-auth.nethealth.com/oauth/token",
    "clientId": "dev-client-id"
  },
  "testUsers": {
    "admin": {
      "username": "admin@test.com",
      "role": "admin"
    },
    "standard": {
      "username": "user@test.com",
      "role": "user"
    }
  }
}
```

### Phase 7: Generate README Documentation

**Create comprehensive documentation for the generated tests:**

```markdown
# API Test Suite - [Application Name]

## Overview
This test suite contains automated API tests for [Application Name] generated by AI and following Net Health's Playwright framework standards.

## Test Coverage Summary
- **Total Tests**: [count]
- **Smoke Tests** (@smoke): [count]
- **Regression Tests** (@regression): [count]
- **Security Tests** (@security): [count]
- **Performance Tests** (@performance): [count]

## Test Execution

### Run All API Tests
```bash
npm run test:api
```

### Run Smoke Tests Only
```bash
npx playwright test --grep "@smoke.*@api"
```

### Run Tests for Specific Module
```bash
npx playwright test tests/api/patients/
```

### Run Tests with Specific Tags
```bash
npx playwright test --grep "@billing.*@api"
```

## Test Data Management
- **Fixtures**: Located in `tests/api/fixtures/`
- **Dynamic Generation**: Use `test-data-generator.ts` utility
- **Environment Configs**: Located in `tests/config/`

## Authentication
Tests use Bearer token authentication stored in environment variables:
- `API_TOKEN_DEV`: Development environment token
- `API_TOKEN_STAGING`: Staging environment token
- `API_TOKEN_PROD`: Production environment token

## CI/CD Integration
Tests are integrated into Azure DevOps pipelines:
- **Daily Smoke Tests**: Runs at 2 AM UTC on DEV
- **Nightly Regression**: Runs at 11 PM UTC on Staging
- **Pre-Production**: Manual trigger before PROD deployments

## Maintenance Guidelines
- **Weekly**: Review and update test data fixtures
- **Monthly**: Update dependencies and Playwright version
- **Quarterly**: Review and update test coverage based on new features

## Test Results
- HTML reports generated in `playwright-report/`
- Test artifacts stored in `test-results/`
- CI/CD artifacts published to Azure DevOps

## Contact
For questions or issues with these tests, contact the QE team or refer to:
- Confluence: Net Health QE Best Practices
- Slack: #qa-automation
```

## Quality Standards and Validation

Before considering the test suite complete, validate:

✅ **API Coverage**: All endpoints discovered have corresponding tests
✅ **Test Completeness**: Each endpoint has happy path + negative + boundary tests
✅ **Code Quality**: All tests follow TypeScript best practices and ESLint rules
✅ **Tag Compliance**: Every test has appropriate tags (@api, @ai-generated, priority, domain)
✅ **Independence**: Tests can run in parallel without conflicts
✅ **Cleanup**: All tests clean up resources they create
✅ **Documentation**: README clearly explains how to run and maintain tests
✅ **Authentication**: Proper auth handling for all protected endpoints
✅ **Performance**: Response time assertions included where appropriate
✅ **Error Handling**: Proper handling of network errors and timeouts
✅ **Healthcare Compliance**: PHI/PII handling validated, audit trails verified

## Output Deliverables

Please provide the complete test suite as follows:

1. **API-Inventory.md** - Complete API discovery documentation
2. **Test-Specifications.md** - Detailed test case specifications
3. **tests/** directory structure with:
   - All `.spec.ts` test files
   - `helpers/api-helper.ts`
   - `fixtures/*.json` files
   - `utils/test-data-generator.ts`
   - `config/env.*.json` files
4. **README.md** - Test suite documentation
5. **Test-Coverage-Report.md** - Summary of coverage by endpoint and test type

## Additional Instructions

- Follow the **exact** folder structure provided
- Use **TypeScript** for all test files
- Include **detailed comments** explaining complex test logic
- Generate **realistic test data** appropriate for healthcare context
- Ensure all tests include **proper error handling**
- Add **performance assertions** (response time < specified threshold)
- Include **at least 3 happy path and 5 negative tests** per endpoint
- Use **test.step()** to make tests readable and debuggable
- Generate tests that will **pass on first run** (no incomplete implementations)
- Include **cleanup logic** in afterEach/afterAll hooks
- Make tests **idempotent** - can be run multiple times safely

## Questions to Clarify

Before beginning, please confirm:
1. What is the path to the codebase directory I should analyze?
2. Are there any specific modules or endpoints you want prioritized?
3. Should I include integration tests between related endpoints?
4. Are there any endpoints that should be excluded (deprecated, internal-only)?
5. Do you want GraphQL tests generated if GraphQL endpoints are found?
6. Should tests include database validation queries (if DB access is available)?
7. What is the target test coverage percentage? (Default: 95% as per your goals)

---

## Example Output Structure

```
outputs/
├── 01-API-Inventory.md
├── 02-Test-Specifications.md
├── 03-README.md
├── 04-Test-Coverage-Report.md
└── tests/
    ├── api/
    │   ├── patients/
    │   │   ├── patients.spec.ts
    │   │   ├── patients-negative.spec.ts
    │   │   └── patients-security.spec.ts
    │   ├── appointments/
    │   │   ├── appointments.spec.ts
    │   │   └── appointments-negative.spec.ts
    │   ├── billing/
    │   │   ├── invoices.spec.ts
    │   │   └── payments.spec.ts
    │   ├── helpers/
    │   │   ├── api-helper.ts
    │   │   ├── auth-helper.ts
    │   │   └── validation-helper.ts
    │   └── fixtures/
    │       ├── patient-valid.json
    │       ├── patient-invalid.json
    │       ├── appointment-valid.json
    │       └── invoice-valid.json
    ├── config/
    │   ├── env.dev.json
    │   ├── env.staging.json
    │   └── env.prod.json
    └── utils/
        ├── test-data-generator.ts
        ├── auth-setup.ts
        └── cleanup-helper.ts
```

Begin your analysis and test generation now. Start with Phase 1: API Discovery.
