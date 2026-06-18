FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build


FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

RUN apt-get update -y && apt-get install -y python3 make g++ openssl \
    && npm ci --omit=dev \
    && npx prisma generate \
    && apt-get purge -y python3 make g++ && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/modules/export/assets ./dist/src/modules/export/assets

COPY prisma.config.js ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]