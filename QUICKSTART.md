# NetHealth RCM-DB Test Automation - Quick Start Guide

This guide will help you get the Playwright framework up and running in minutes.

## ⚡ Prerequisites Check

Before starting, verify you have the required versions:

```bash
# Verify Node.js version (18.x or higher required)
node --version

# Verify npm version (9.x or higher required)
npm --version
```

If you need to install or update Node.js, visit: https://nodejs.org/

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd NetHealth.RCM-DB.Tests.Automation
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Playwright, TypeScript, and test utilities.

### 3. Install Playwright Browsers

```bash
npm run install:browsers
```

This downloads Chromium, Firefox, and WebKit browsers with all system dependencies.

### 4. (Optional) Initialize Playwright Agents

For AI-powered test generation:

```bash
npm run init:agents
```

This creates agent definitions for:
- 🎭 **Planner**: Generates test plans from your application
- 🎭 **Generator**: Creates Playwright tests from test plans
- 🎭 **Healer**: Automatically fixes failing tests

### 5. Set Up Environment Variables

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env

# Edit with your favorite text editor
notepad .env    # Windows
nano .env       # Mac/Linux
```

Update these values in `.env`:
- `ENV` - Environment to run tests (dev/staging/prod)
- `DEV_BASE_URL` - Your development environment URL
- `DEV_API_URL` - Development API URL
- `DEV_ADMIN_USER` - Admin username
- `DEV_ADMIN_PASS` - Admin password
- `DEV_CLINICIAN_USER` - Clinician username
- `DEV_CLINICIAN_PASS` - Clinician password

**⚠️ Important**: Never commit the `.env` file. It's already in `.gitignore`.

## First Test Run

### Option 1: Run Smoke Tests (Fastest - Recommended First Run)

```bash
npm run test:smoke
```

This runs critical tests tagged with `@smoke` (~5-10 minutes).

### Option 2: Run All Tests

```bash
npm test
```

This runs the complete test suite.

### Option 3: Run in UI Mode (Recommended for Learning)

```bash
npm run test:ui
```

This opens Playwright's interactive UI where you can:
- See all tests organized by file
- Run individual tests or groups
- Debug step-by-step
- View screenshots and traces
- Filter tests by tags

### Option 4: Run RCM-Specific Tests

```bash
npm run test:rcm           # All RCM tests
npm run test:rcm:smoke     # RCM smoke tests only
npm run test:rcm:critical  # RCM critical tests only
```

## View Test Reports

After running tests, view the HTML report:

```bash
npm run report
```

This opens a detailed HTML report in your browser showing:
- Test results (passed/failed/skipped)
- Screenshots of failures
- Video recordings
- Execution traces
- Performance metrics

## 📝 Write Your First Test

### Step 1: Create a New Test File

Create a new test file in `tests/` folder following the naming convention:
```
tests/my-feature/my-test.spec.ts
```

**Naming Convention**: `{action}-{entity}-{scenario}.spec.ts`

Examples:
- `search-patient.spec.ts`
- `create-claim.spec.ts`
- `verify-revenue-report.spec.ts`

### Step 2: Use This Template

```typescript
import { test, expect } from '../../fixtures';

test.describe('My Feature @my-feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/your-page');
  });

  test('my first test @smoke @functional', async ({ page }) => {
    await test.step('Fill out form', async () => {
      await page.getByLabel('Your Field').fill('Test Value');
      await page.getByRole('button', { name: 'Submit' }).click();
    });
    
    await test.step('Verify success', async () => {
      await expect(page.getByText('Success')).toBeVisible();
    });
  });
});
```

### Step 3: Run Your Test

```bash
# Run specific test file
npx playwright test tests/my-feature/my-test.spec.ts

# Run with UI mode (recommended)
npx playwright test tests/my-feature/my-test.spec.ts --ui

# Run in debug mode
npx playwright test tests/my-feature/my-test.spec.ts --debug
```

## 🎨 Use Code Generation

Playwright can generate tests by recording your actions:

```bash
npm run codegen
```

This opens a browser and records all your actions as test code! Perfect for:
- Learning Playwright syntax
- Quickly creating test scaffolds
- Discovering element locators

### Explore Example Tests

Check out these folders for working examples:
- **`tests/rcm/`** - RCM-specific tests (claims, revenue, patient search)
- **`tests/patient/`** - Patient management tests
- **`tests/api/`** - API testing examples

### Explore the Framework

- **Tests**: `tests/` folder - Organized by feature area
- **Page Objects**: `pages/` folder - Reusable page components
- **Test Data**: `data/dev/` folder - Test data files (JSON)
- **Utilities**: `utils/` folder - Helper functions
  - `test-data-generator.ts` - Generate realistic test data
  - `api-helper.ts` - API utility functions
  - `date-helper.ts` - Date manipulation helpers

## 🎯 Common Commands Reference

### Running Tests

```bash
# All tests
npm test

# By tag
npm run test:smoke          # Quick smoke tests
npm run test:regression     # Full regression suite
npm run test:api            # API tests only

# By feature area
npm run test:rcm            # All RCM tests
npm run test:patients       # Patient tests
npm run test:revenue        # Revenue tests
npm run test:claims         # Claims tests

# By environment
npm run test:dev            # Run on dev
npm run test:staging        # Run on staging
npm run test:prod           # Run on production (safe tests only)

# By browser
npm run test:chromium       # Chrome/Edge
npm run test:firefox        # Firefox
npm run test:webkit         # Safari

# Interactive modes
npm run test:ui             # UI mode
npm run test:headed         # See browser
npm run test:debug          # Debug with inspector

# Specific test file
npx playwright test tests/rcm/search-patient.spec.ts
```

### Development Commands

```bash
# Generate test code
npm run codegen

# View report
npm run report

# Setup/verify installation
npm run test:setup
```

## 🔧 Troubleshooting

### Issue: Tests fail with "Browser not installed"

**Solution**:
```bash
npm run install:browsers
```

### Issue: Authentication fails

**Solution**:
1. Check your `.env` file has correct credentials
2. Verify URLs are accessible
3. Regenerate auth state:
```bash
npm run test:setup
```

### Issue: TypeScript errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Can't find module errors

**Solution**: Ensure you're in the correct directory:
```bash
cd NetHealth.RCM-DB.Tests.Automation
npm install
```

### Issue: Tests timeout

**Solution**: Increase timeout in your test:
```typescript
test.setTimeout(90000); // 90 seconds
```

Or adjust globally in `playwright.config.ts`

### Issue: Element not found errors

**Solution**: Add proper waits:
```typescript
await page.waitForLoadState('networkidle');
await expect(page.getByRole('button')).toBeVisible({ timeout: 10000 });
```

## 🤖 Using Playwright Agents (AI-Powered)

### Initialize Agents

```bash
npm run init:agents
```

### Generate Test Plans

In VS Code with GitHub Copilot or Claude:
```
"Generate a test plan for patient search functionality"
```

The Planner agent will explore your application and create a detailed test plan.

### Generate Tests from Plans

```
"Generate Playwright tests from specs/rcm/patient-search.md"
```

The Generator agent creates executable test code from markdown test plans.

### Heal Failing Tests

```
"Heal the failing test: search-patient.spec.ts"
```

The Healer agent analyzes failures and automatically fixes common issues.

## 📚 Next Steps

### Documentation to Read

1. **[README.md](README.md)** - Complete framework documentation
2. **[NetHealth-Playwright-Framework-Setup-Guide.md](NetHealth-Playwright-Framework-Setup-Guide.md)** - Detailed setup guide
3. **[RCM-QUICK-REFERENCE.md](RCM-QUICK-REFERENCE.md)** - RCM-specific testing reference

### Learning Resources

- **[Playwright Documentation](https://playwright.dev/docs/intro)** - Official docs
- **[Playwright Test Agents](https://playwright.dev/docs/test-agents)** - AI-powered testing
- **Example Tests** - Review `tests/` directory for working examples

### Get Involved

1. Join the QA team Slack channel: **#qa-automation**
2. Review existing tests in the repository
3. Attend QA team meetings
4. Start contributing tests for your features

## 🆘 Getting Help

- **Slack**: #qa-automation
- **Email**: qa-team@nethealth.com
- **Azure DevOps**: Create a work item
- **Documentation**: See `README.md` and other guides in the repository

## 📊 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `ENV` | Environment to run tests (dev/staging/prod) | Yes |
| `DEV_BASE_URL` | Development base URL | Yes |
| `DEV_API_URL` | Development API URL | Yes |
| `DEV_ADMIN_USER` | Admin username | Yes |
| `DEV_ADMIN_PASS` | Admin password | Yes |
| `DEV_CLINICIAN_USER` | Clinician username | Yes |
| `DEV_CLINICIAN_PASS` | Clinician password | Yes |

**Note**: Copy the same pattern for `STAGING_*` and `PROD_*` variables.

## ✅ Setup Verification Checklist

Complete these steps to verify your setup:

- [ ] Node.js 18.x or higher installed
- [ ] npm 9.x or higher installed
- [ ] Dependencies installed (`npm install`)
- [ ] Browsers installed (`npm run install:browsers`)
- [ ] `.env` file created and configured with credentials
- [ ] Smoke tests pass (`npm run test:smoke`)
- [ ] HTML report opens successfully (`npm run report`)
- [ ] (Optional) Playwright Agents initialized (`npm run init:agents`)

## 🚀 What's Next?

Your learning path:

1. ✅ **Install dependencies** - You've completed this!
2. ✅ **Set up environment variables** - Done!
3. ✅ **Run your first test** - Completed!
4. 📝 **Write tests for your features** - Start with small tests
5. 🎨 **Use code generation** - Learn Playwright syntax faster
6. 🤖 **Try AI-powered test generation** - Experiment with Playwright Agents
7. 📚 **Read best practices** - Review README.md and setup guide
8. 🚀 **Set up CI/CD pipeline** - Configure Azure DevOps (see `azure-pipelines.yml`)

**Congratulations! You're ready to start testing! 🎉**

---

**Built with ❤️ by the Net Health QE Team**
