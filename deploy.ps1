# CounselFlow Ultimate - Fly.io Deployment Script (PowerShell)
Write-Host "🚀 Deploying CounselFlow Ultimate to Fly.io (FREE TIER)" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# Check if flyctl is installed
if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ flyctl is not installed. Installing now..." -ForegroundColor Yellow
    Write-Host "Installing flyctl CLI..." -ForegroundColor Blue
    irm https://fly.io/install.ps1 | iex
    Write-Host "✅ flyctl installed successfully!" -ForegroundColor Green
    Write-Host "Please restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$authStatus = flyctl auth whoami 2>&1
if ($authStatus -like "*not logged in*" -or $LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Fly.io" -ForegroundColor Red
    Write-Host "Please login first: flyctl auth login" -ForegroundColor Yellow
    exit 1
}

# Check if flyctl is installed
try {
    flyctl version | Out-Null
} catch {
    Write-Host "❌ flyctl is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   PowerShell: irm https://fly.io/install.ps1 | iex" -ForegroundColor Yellow
    Write-Host "   Or visit: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Yellow
    exit 1
}

# Check if logged into Fly.io
try {
    flyctl auth whoami | Out-Null
} catch {
    Write-Host "🔐 Please log into Fly.io first:" -ForegroundColor Yellow
    Write-Host "   flyctl auth login" -ForegroundColor Yellow
    exit 1
}

# Build and deploy
Write-Host "📦 Building and deploying application..." -ForegroundColor Cyan
flyctl deploy --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app is available at: https://counselflow-ultimate.fly.dev" -ForegroundColor Blue
    Write-Host "📊 Monitor at: https://fly.io/dashboard/counselflow-ultimate" -ForegroundColor Blue
} else {
    Write-Host "❌ Deployment failed. Check the logs above for details." -ForegroundColor Red
    exit 1
}
