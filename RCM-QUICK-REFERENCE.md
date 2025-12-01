# RCM Direct Billing Test Automation - Quick Reference

## 🚀 Quick Commands

### Run Tests
```bash
# All RCM tests
npm test tests/rcm/

# Smoke tests (5-10 min)
npx playwright test --grep "@rcm.*@smoke"

# By module
npx playwright test --grep @patients
npx playwright test --grep @revenue  
npx playwright test --grep @claims

# Critical tests only
npx playwright test --grep @critical

# With UI (recommended)
npm run test:ui

# Debug mode
npm run test:debug

# View report
npm run report
```

### Environment Setup
```bash
# Install dependencies
npm install

# Install browsers
npm run install:browsers

# Run setup
npx playwright test tests/seed.spec.ts
```

---

## 📁 Key Files

### Page Objects (`pages/rcm/`)
- `patient-search.page.ts` - Patient search & reconciliation
- `revenue.page.ts` - Revenue posting & quick claims
- `claims.page.ts` - Claims creation & management

### Test Suites (`tests/rcm/`)
- `patient-search.spec.ts` - 10 patient tests
- `revenue.spec.ts` - 11 revenue tests
- `claims.spec.ts` - 17 claims tests

### Test Specs (`specs/rcm/`)
- `patient-search.md` - Patient workflow specs
- `revenue-management.md` - Revenue workflow specs
- `claims-management.md` - Claims workflow specs

### Configuration
- `config/dev.config.ts` - RCM environment config
- `data/dev/rcm-test-data.json` - Test data
- `.env` - Environment variables

---

## 🎯 Test Coverage (38+ tests)

### Patients (10 tests)
✅ Agency/branch search  
✅ Last name search  
✅ FRP statement filter  
✅ Combined filters  
✅ Pagination  
✅ Empty results  
✅ Performance

### Revenue (11 tests)
✅ Post charges  
✅ Division filters  
✅ Job monitoring  
✅ Date validation  
✅ Quick claims  
✅ Performance

### Claims (17 tests)
✅ Create claims  
✅ Payer selection  
✅ Month-end close  
✅ Batch management  
✅ FRP statements  
✅ Job completion  
✅ Performance

---

## 🔧 Configuration

### Credentials (.env)
```bash
DEV_USER=Optima.RambabuN
DEV_PASS=Password@123
DEV_BASE_URL=https://basereg.therapy.nethealth.com
```

### Module Endpoints
- Patients: `/Financials#/patient/search`
- Revenue: `/Financials#/revenue/revenue`
- Claims: `/Financials#/claims/generation`

---

## 🐛 Troubleshooting

### Auth fails?
```bash
npx playwright test tests/seed.spec.ts
```

### Tests timeout?
- Check `playwright.config.ts` timeout settings
- Verify app is accessible

### Element not found?
- Update locators in page objects
- Use `npm run codegen` to generate new locators

### Flaky tests?
- Add explicit waits: `await expect(element).toBeVisible()`
- Use `waitForLoadState('networkidle')`

---

## 📊 Reports

- **HTML:** `playwright-report/index.html`
- **JSON:** `test-results/results.json`
- **JUnit:** `test-results/junit.xml`
- **Artifacts:** Screenshots, videos, traces on failure

---

## 🎓 Next Steps

1. Run seed test: `npx playwright test tests/seed.spec.ts`
2. Run smoke tests: `npx playwright test --grep "@rcm.*@smoke"`
3. View report: `npm run report`
4. Customize test data in `data/dev/rcm-test-data.json`

---

## 📚 Documentation

- Full Setup Guide: `NetHealth-Playwright-Framework-Setup-Guide.md`
- Setup Complete: `RCM-SETUP-COMPLETE.md`
- Playwright Docs: https://playwright.dev

---

**Questions?** Check `RCM-SETUP-COMPLETE.md` for detailed information.

**Happy Testing! 🚀**
