#!/bin/bash

# CounselFlow Ultimate - Fly.io Deployment Script
echo "🚀 Deploying CounselFlow Ultimate to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   PowerShell: irm https://fly.io/install.ps1 | iex"
    echo "   Or visit: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged into Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please log into Fly.io first:"
    echo "   flyctl auth login"
    exit 1
fi

# Build and deploy
echo "📦 Building and deploying application..."
flyctl deploy --verbose

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is available at: https://counselflow-ultimate.fly.dev"
    echo "📊 Monitor at: https://fly.io/dashboard/counselflow-ultimate"
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi
