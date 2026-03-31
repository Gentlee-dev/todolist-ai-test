FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared package
COPY packages/shared ./packages/shared/

# Copy web package
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]
