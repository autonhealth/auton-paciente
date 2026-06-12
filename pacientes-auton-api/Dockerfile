# ───────────────────────── builder ─────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# instala TODAS as deps (inclui dev: typescript, tsc-alias) p/ compilar
COPY package.json package-lock.json ./
RUN npm ci

# compila TS -> dist/ (tsc + tsc-alias resolve os aliases @/*)
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

# ───────────────────────── runtime ─────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# só deps de produção (sem typescript/tsx/etc.)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# artefato compilado
COPY --from=builder /app/dist ./dist

# Cloud Run injeta PORT (default 8080); o app escuta em 0.0.0.0:$PORT.
# As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem vir do ambiente
# (Cloud Run env vars / Secret Manager) — nunca embutidas na imagem.
EXPOSE 8080
CMD ["node", "dist/src/index.js"]
