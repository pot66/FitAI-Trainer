# ==========================================
# Stage 1: Build the Vite production bundle
# ==========================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve via Nginx (High Performance)
# ==========================================
FROM nginx:alpine

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx SPA reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
