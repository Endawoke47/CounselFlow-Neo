# 🚀 CounselFlow Ultimate - Fly.io Deployment Guide

This guide will help you deploy your CounselFlow Ultimate application to Fly.io using Docker.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **flyctl CLI**: Install the Fly.io command line tool
3. **Docker**: Ensure Docker is running (for local testing)

## 1. Install flyctl

### Windows (PowerShell)
```powershell
irm https://fly.io/install.ps1 | iex
```

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

## 2. Login to Fly.io

```bash
flyctl auth login
```

## 3. Deploy Your Application

### Option A: Quick Deploy (Recommended)
```bash
# Windows
./deploy.ps1

# macOS/Linux
./deploy.sh
```

### Option B: Manual Steps

1. **Initialize the app** (first time only):
```bash
flyctl launch --copy-config --yes
```

2. **Deploy the application**:
```bash
flyctl deploy --verbose
```

## 4. Monitor Your Deployment

### Check Status
```bash
flyctl status
```

### View Logs
```bash
flyctl logs
```

### Open in Browser
```bash
flyctl open
```

## 5. Environment Variables (Optional)

Set environment variables if needed:
```bash
flyctl secrets set NODE_ENV=production
flyctl secrets set DATABASE_URL=your_database_url
```

## 6. Scaling (Optional)

Scale your application as needed:
```bash
# Scale to 2 instances
flyctl scale count 2

# Scale memory
flyctl scale memory 2048
```

## 7. Custom Domain (Optional)

Add your custom domain:
```bash
flyctl domains add yourdomain.com
flyctl certs create yourdomain.com
```

## Configuration Files

- `fly.toml` - Fly.io configuration
- `apps/web/Dockerfile` - Docker configuration
- `.dockerignore` - Files to exclude from Docker build

## npm Scripts Available

```bash
npm run deploy          # Deploy to Fly.io
npm run deploy:setup    # First-time setup
npm run deploy:logs     # View deployment logs
npm run deploy:status   # Check app status
npm run deploy:scale    # Scale to 2 instances
```

## Troubleshooting

### Build Issues
- Ensure all dependencies are in package.json
- Check .dockerignore excludes unnecessary files
- Verify Next.js standalone output is enabled

### Runtime Issues
- Check logs: `flyctl logs`
- Verify environment variables are set
- Ensure health check endpoint responds

### Performance Issues
- Scale memory: `flyctl scale memory 1024`
- Add more instances: `flyctl scale count 2`
- Check metrics in Fly.io dashboard

## Application URLs

- **Production**: https://counselflow-ultimate.fly.dev
- **Dashboard**: https://fly.io/dashboard/counselflow-ultimate
- **Metrics**: Available in Fly.io dashboard

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Community**: https://community.fly.io
- **Status**: https://status.fly.io

## Security Notes

- All traffic is HTTPS-only
- App runs as non-root user
- Health checks monitor uptime
- Auto-scaling enabled for traffic spikes

---

**Ready to deploy?** Run `./deploy.ps1` (Windows) or `./deploy.sh` (macOS/Linux) to get started!
