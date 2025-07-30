# Multi-stage Dockerfile for Backend Production Deployment
FROM node:18-alpine AS base

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build stage
FROM base AS builder
RUN npm run build:backend

# Production stage
FROM node:18-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files for production install
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/shared/src ./packages/shared/src

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S wildeditor -u 1001
USER wildeditor

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "run", "start", "--workspace=@wildeditor/backend"]