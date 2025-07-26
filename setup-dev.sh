#!/bin/bash
# CounselFlow-Neo Development Environment Setup

echo "🚀 Setting up CounselFlow-Neo development environment..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Check if Node.js version is compatible (v18+ recommended)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "⚠️  Warning: Node.js v18+ is recommended. Current version: $NODE_VERSION"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment variables for web app
if [ ! -f apps/web/.env ]; then
    echo "🔧 Creating web app .env file..."
    cat > apps/web/.env << EOF
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
EOF
    echo "⚠️  Please update apps/web/.env with your configuration"
fi

# Setup environment variables for API
if [ ! -f apps/api/.env ]; then
    echo "🔧 Creating API .env file..."
    cat > apps/api/.env << EOF
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
EOF
    echo "⚠️  Please update apps/api/.env with your configuration"
fi

# Initialize database
echo "🗄️  Setting up database..."
cd apps/api && npx prisma generate && npx prisma db push && cd ../..

# Build TypeScript packages
echo "🔨 Building shared packages..."
npm run build --workspace=packages/shared
npm run build --workspace=packages/database

# Check if ports are available
echo "🔍 Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Please stop the service or use a different port."
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use. Please stop the service or use a different port."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p apps/web/public/uploads
mkdir -p apps/api/logs
mkdir -p apps/api/uploads

# Set proper permissions
chmod +x setup-dev.sh

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env files with your actual configuration"
echo "2. Run 'npm run dev' to start both web and API servers"
echo "3. Visit http://localhost:3000 to see your application"
echo ""
echo "🛠️  Available commands:"
echo "   npm run dev          - Start development servers"
echo "   npm run build        - Build for production"
echo "   npm run test         - Run tests"
echo "   npm run lint         - Run linting"
echo ""
echo "📚 For more information, see README.md"
