FROM node:18-alpine as frontend
WORKDIR /app/client

# Install pnpm
RUN npm install -g pnpm

# Copy client package files and install dependencies
COPY client/package*.json ./
COPY client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy client source files
COPY client/ ./

# Build the client
ENV NODE_ENV=production
RUN pnpm rebuild
RUN pnpm run build

FROM node:18-alpine
WORKDIR /app/server

# Install pnpm
RUN npm install -g pnpm

# First copy only package files and install dependencies
COPY server/package*.json ./
COPY server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Now copy server code without node_modules
COPY server/*.js ./
COPY server/config ./config
COPY server/middleware ./middleware
COPY server/routes ./routes
COPY server/utils ./utils
COPY server/websockets ./websockets
COPY server/init.sql ./init.sql

# Copy built frontend from the frontend stage
COPY --from=frontend /app/client/dist ./build

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Run server
CMD ["node", "index.js"] 