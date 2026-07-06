# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Development  (hot-reload via ng serve)
# Usage: docker compose up
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source (will be overridden by volume mount in docker-compose)
COPY . .

EXPOSE 4200

CMD ["npm", "start"]


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Build  (AOT production build)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 – Production  (lightweight nginx static server)
# Usage: docker compose --profile production up
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS prod

# Copy built Angular app
COPY --from=build /app/dist/circuit-simulator/browser /usr/share/nginx/html

# Custom nginx config (SPA routing + compression + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
