# ── Frontend React/Vite — build de production ────────────────

# Étape 1 : build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Étape 2 : serveur nginx léger
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx pour React Router (SPA : toutes les routes → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
