# =========================================================================
# BACKEND REST API DOCKERFILE (SALAM LMS STAI AL-ITTIHAD)
# =========================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

# =========================================================================
# PRODUCTION RUNTIME
# =========================================================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./dist/db/migrations

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
