# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force
RUN cd frontend && npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/package*.json ./backend/
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p /app/backend/uploads && chown nodejs:nodejs /app/backend/uploads

# Set user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
