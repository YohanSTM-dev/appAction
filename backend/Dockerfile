# ── Backend Node.js ──────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copier les dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le reste du code
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
