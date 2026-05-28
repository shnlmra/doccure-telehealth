# ==========================================
# Development Stage
# ==========================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy application source
COPY . .

# Expose backend API port
EXPOSE 4000

CMD ["npm", "run", "start:dev"]

# ==========================================
# Build Stage
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Remove development dependencies for smaller production size
RUN npm prune --production && npm cache clean --force

# ==========================================
# Production Stage
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose backend API port
EXPOSE 4000

CMD ["npm", "run", "start:prod"]
