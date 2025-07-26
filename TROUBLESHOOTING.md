# CounselFlow-Neo Development Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Installation Issues

#### Node.js Version Compatibility
**Problem**: Webpack or build errors
**Solution**: 
```bash
# Check Node.js version
node -v
# Should be v18+ for best compatibility
```

#### Port Already in Use
**Problem**: `EADDRINUSE: address already in use`
**Solutions**:
```bash
# Windows - Kill processes on ports
taskkill /F /PID $(netstat -ano | findstr :3000 | awk '{print $5}')
taskkill /F /PID $(netstat -ano | findstr :8080 | awk '{print $5}')

# Linux/macOS - Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

#### Dependency Issues
**Problem**: Module not found or version conflicts
**Solution**:
```bash
# Full reset (Windows)
npm run reset:win

# Full reset (Unix)
npm run reset
```

### Development Server Issues

#### Blank White Screen
**Solutions**:
1. Check browser console for errors
2. Verify environment variables in `.env` files
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check if API server is running on port 8080

#### Webpack Compilation Errors
**Solutions**:
1. Clear Next.js cache: `rm -rf apps/web/.next`
2. Restart development server
3. Check for TypeScript errors: `npm run typecheck`

#### API Connection Errors
**Solutions**:
1. Verify API server is running: `npm run dev:api`
2. Check API health: `curl http://localhost:8080/api/health`
3. Verify environment variables in `apps/api/.env`

### Database Issues

#### Prisma Schema Errors
**Problem**: Database schema out of sync
**Solution**:
```bash
npm run db:reset  # This will reset and migrate
```

#### Database Lock Errors
**Problem**: Database is locked
**Solution**:
```bash
# Stop all Node.js processes
taskkill /F /IM node.exe

# Reset database
npm run db:reset
```

### Performance Issues

#### Slow Build Times
**Solutions**:
1. Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
2. Clear all caches: `npm run clean`
3. Use incremental builds during development

#### High Memory Usage
**Solutions**:
1. Restart development servers periodically
2. Close unused browser tabs
3. Use `npm run dev:web` only if you don't need the API

### AI Service Issues

#### AI Gateway Errors
**Problem**: AI services not responding
**Solutions**:
1. Check AI service health: `curl http://localhost:8080/api/v1/ai/health`
2. Verify API keys in `apps/api/.env`
3. Check logs: `tail -f apps/api/logs/combined.log`

#### Ollama Connection Issues
**Problem**: Self-hosted AI not working
**Solutions**:
1. Install Ollama: `https://ollama.ai/download`
2. Pull required model: `ollama pull llama2`
3. Start Ollama service: `ollama serve`

### Testing Issues

#### Test Failures
**Solutions**:
1. Run tests individually: `npm test -- --testNamePattern="specific test"`
2. Clear test cache: `npm test -- --clearCache`
3. Update snapshots: `npm test -- --updateSnapshot`

### Environment Configuration

#### Missing Environment Variables
**Problem**: Configuration errors
**Solution**:
```bash
# Re-run setup script
.\setup-dev.ps1  # Windows
./setup-dev.sh   # Unix

# Manually check .env files exist
ls apps/web/.env apps/api/.env
```

#### CORS Errors
**Problem**: Cross-origin request blocked
**Solution**: Verify `NEXT_PUBLIC_API_URL` in `apps/web/.env` matches your API server URL

### Production Deployment Issues

#### Docker Build Failures
**Solutions**:
1. Check Dockerfile syntax
2. Verify all dependencies are in package.json
3. Clear Docker cache: `docker system prune -a`

#### SSL/HTTPS Issues
**Solutions**:
1. Verify SSL certificates are valid
2. Check reverse proxy configuration
3. Update environment URLs to use HTTPS

## 🆘 Getting Help

### Debug Information to Collect
When reporting issues, include:
1. Node.js version: `node -v`
2. npm version: `npm -v`
3. Operating system
4. Error messages (full stack trace)
5. Browser console errors
6. Steps to reproduce

### Logs Location
- API logs: `apps/api/logs/`
- Next.js logs: Browser console and terminal
- Database logs: Prisma debug output

### Support Channels
1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Check troubleshooting section in README.md

## 🔧 Advanced Debugging

### Enable Verbose Logging
```bash
# API debugging
DEBUG=* npm run dev:api

# Next.js debugging
DEBUG=* npm run dev:web
```

### Performance Profiling
```bash
# Profile build performance
NODE_OPTIONS="--inspect" npm run build

# Memory usage analysis
NODE_OPTIONS="--inspect --max-old-space-size=4096" npm run dev
```

### Database Debugging
```bash
# Enable Prisma query logging
DATABASE_LOG_LEVEL=info npm run dev:api

# Manual database inspection
npm run db:studio
```
