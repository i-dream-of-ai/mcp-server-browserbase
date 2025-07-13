# ----- Build Stage -----
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy package files first for dependency caching
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy configuration and source code
COPY tsconfig.json ./
COPY src ./src
COPY config.d.ts index.d.ts ./

# Build the application
RUN pnpm build

# ----- Production Stage -----
FROM node:lts-alpine
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built artifacts and required files
COPY --from=builder /app/dist ./dist
COPY index.js config.d.ts index.d.ts cli.js ./

# Expose HTTP port
EXPOSE 8080

# Default command using CLI flags
CMD ["node", "cli.js", "--port", "8080"]