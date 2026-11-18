FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies using bun.lock
COPY package.json bun.lock* ./
RUN bun install

# Copy source code
COPY . .

# Build TanStack Start SSR application
RUN bun run build

# Runner stage using Node 22
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Copy output from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
