# CounselFlow-Neo Development Environment Setup (Windows)
# PowerShell Script

Write-Host "🚀 Setting up CounselFlow-Neo development environment..." -ForegroundColor Green

# Check Node.js version
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
    
    # Check if Node.js version is compatible (v18+ recommended)
    $nodeMajor = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
    if ($nodeMajor -lt 18) {
        Write-Host "⚠️  Warning: Node.js v18+ is recommended. Current version: $nodeVersion" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js v18+ first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Setup environment variables for web app
if (-not (Test-Path "apps/web/.env")) {
    Write-Host "🔧 Creating web app .env file..." -ForegroundColor Yellow
    @"
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Configuration
NEXT_PUBLIC_AI_ENDPOINT=http://localhost:8080/api/ai
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# Performance Configuration
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=false

# Development flags
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
"@ | Out-File -FilePath "apps/web/.env" -Encoding utf8
    Write-Host "⚠️  Please update apps/web/.env with your configuration" -ForegroundColor Yellow
}

# Setup environment variables for API
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "🔧 Creating API .env file..." -ForegroundColor Yellow
    @"
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
DATABASE_URL="file:./dev.db"

# AI Configuration
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GOOGLE_API_KEY=your-google-key-here

# Security
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Logging
LOG_LEVEL=debug
"@ | Out-File -FilePath "apps/api/.env" -Encoding utf8
    Write-Host "⚠️  Please update apps/api/.env with your configuration" -ForegroundColor Yellow
}

# Initialize database
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location "apps/api"
npx prisma generate
npx prisma db push
Set-Location "../.."

# Build TypeScript packages
Write-Host "🔨 Building shared packages..." -ForegroundColor Yellow
npm run build --workspace=packages/shared
npm run build --workspace=packages/database

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use. Please stop the service or use a different port." -ForegroundColor Yellow
}

$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "⚠️  Port 8080 is already in use. Please stop the service or use a different port." -ForegroundColor Yellow
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "apps/web/public/uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/api/logs" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/api/uploads" | Out-Null

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env files with your actual configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start both web and API servers" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see your application" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Available commands:" -ForegroundColor Cyan
Write-Host "   npm run dev          - Start development servers" -ForegroundColor White
Write-Host "   npm run build        - Build for production" -ForegroundColor White
Write-Host "   npm run test         - Run tests" -ForegroundColor White
Write-Host "   npm run lint         - Run linting" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see README.md" -ForegroundColor White
