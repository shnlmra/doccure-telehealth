# ==========================================
# Development Stage
# ==========================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose Next.js default port
EXPOSE 3000

CMD ["npm", "run", "dev"]

# ==========================================
# Build Stage
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY . .

# Build the Next.js static and server files
RUN npm run build

# ==========================================
# Production Stage
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary runtime folders
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start"]
