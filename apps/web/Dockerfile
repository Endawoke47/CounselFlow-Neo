# Simplified build for CounselFlow Ultimate
FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Copy workspace packages
COPY packages/ ./packages/

# Install all dependencies
RUN npm install

# Copy web app source
COPY apps/web/ ./apps/web/

# Build the application
WORKDIR /app/apps/web
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
