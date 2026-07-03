FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat ffmpeg
COPY package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ffmpeg
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache ffmpeg
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && node server.js"]
