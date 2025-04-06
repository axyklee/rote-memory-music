# Base image with Bun
FROM oven/bun:latest AS base

WORKDIR /app

# Copy dependencies and install
COPY bun.lock package.json ./
COPY prisma ./prisma
RUN bun install

# Copy the rest of the app
COPY . .

ENV SKIP_ENV_VALIDATION=true

# Build the app
RUN bun run build

# -----
# Production image
FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built output and dependencies
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/prisma ./prisma

EXPOSE 3000

CMD ["bun", "x", "run", "start"]
