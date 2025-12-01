# NetHealth RCM-DB Test Automation - Setup Script
# Run this script to complete the initial setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NetHealth RCM-DB Test Automation Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18.x or higher from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Install Playwright browsers
Write-Host "Installing Playwright browsers (this may take a few minutes)..." -ForegroundColor Yellow
npx playwright install --with-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Playwright browsers!" -ForegroundColor Red
    exit 1
}

Write-Host "Playwright browsers installed successfully!" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit .env file and add your credentials!" -ForegroundColor Yellow
    Write-Host "Required: DEV_USER and DEV_PASS" -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

Write-Host ""

# Create auth directory if it doesn't exist
if (-not (Test-Path "auth")) {
    Write-Host "Creating auth directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "auth" | Out-Null
    Write-Host "Auth directory created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your credentials" -ForegroundColor White
Write-Host "2. Run: npm run test:smoke" -ForegroundColor White
Write-Host "3. View report: npm run report" -ForegroundColor White
Write-Host ""

Write-Host "Quick Commands:" -ForegroundColor Yellow
Write-Host "  npm test                 - Run all tests" -ForegroundColor White
Write-Host "  npm run test:smoke       - Run smoke tests" -ForegroundColor White
Write-Host "  npm run test:headed      - See browser" -ForegroundColor White
Write-Host "  npm run test:ui          - Interactive mode" -ForegroundColor White
Write-Host "  npm run report           - View results" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  QUICKSTART.md            - Quick start guide" -ForegroundColor White
Write-Host "  README.md                - Full documentation" -ForegroundColor White
Write-Host "  SETUP_COMPLETE.md        - Setup summary" -ForegroundColor White
Write-Host ""

Write-Host "Happy Testing! 🎉" -ForegroundColor Green
