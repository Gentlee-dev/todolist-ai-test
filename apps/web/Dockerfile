FROM node:20-alpine

RUN apk add --no-cache libc6-compat

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy shared package
COPY packages/shared ./packages/shared/

# Copy web package
COPY apps/web ./apps/web/

RUN pnpm install

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "exec", "next", "dev", "--turbopack"]
